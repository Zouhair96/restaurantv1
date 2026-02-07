import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PublicMenuPizza1 from './PublicMenuPizza1'
import PublicMenuTestemplate from './PublicMenuTestemplate'
import { useLanguage } from '../context/LanguageContext'
import { useLoyalty } from '../context/LoyaltyContext'
import { useCart } from '../context/CartContext'

const PublicMenu = () => {
    const { restaurantName, templateKey } = useParams()
    const decodedName = restaurantName ? decodeURIComponent(restaurantName) : null;

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { t } = useLanguage()
    const { trackVisit, isStorageLoaded, markRewardAsUsed } = useLoyalty()
    const { setContextScope } = useCart()

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                let response;
                if (templateKey) {
                    // MODE: Master Template Preview
                    response = await fetch(`/.netlify/functions/templates?templateKey=${templateKey}`)
                } else if (decodedName) {
                    // MODE: Restaurant Public Menu
                    response = await fetch(`/.netlify/functions/public-menu?restaurantName=${encodeURIComponent(decodedName)}`)
                }

                if (!response) return;
                const result = await response.json()

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to load menu')
                }

                // NORMALIZE DATA: If we got a direct template (Master Preview), wrap it to look like a Menu payload
                if (templateKey && result && !result.menu) {
                    setData({
                        restaurant: 'Master Preview',
                        menu: {
                            template_type: templateKey,
                            base_layout: result.base_layout || 'grid',
                            config: {
                                ...result.config,
                                ...result.menu?.config,
                                items: result.items || []
                            }
                        }
                    });
                } else {
                    setData(result);
                    // Centralized Loyalty Tracking
                    if (decodedName && isStorageLoaded) {
                        console.log('[PublicMenu] Tracking visit for:', decodedName);
                        trackVisit(decodedName);
                        // Isolate Cart for this Restaurant
                        setContextScope(decodedName);
                    }
                }
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (decodedName || templateKey) {
            fetchMenu()
        }
    }, [decodedName, templateKey, isStorageLoaded])

    // ... (rest of code)

    // Branch to specialized templates
    if (data.menu.template_type === 'pizza1' || templateKey === 'pizza1') {
        return <PublicMenuPizza1 restaurantName={decodedName} />
    }

    if (data.menu?.template_type === 'testemplate' || templateKey === 'testemplate') {
        return <PublicMenuTestemplate restaurantName={decodedName} />
    }

    // Default to Pizza1 for all other cases
    return <PublicMenuPizza1 restaurantName={decodedName} />
}

export default PublicMenu
