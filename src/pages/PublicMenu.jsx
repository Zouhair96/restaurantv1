import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PublicMenuPizza1 from './PublicMenuPizza1'
import PublicMenuTestemplate from './PublicMenuTestemplate'
import PublicMenuTestemplate2 from './PublicMenuTestemplate2'

import PublicMenuGrid from './PublicMenuGrid'
import PublicMenuList from './PublicMenuList'
import PublicMenuMagazine from './PublicMenuMagazine'
import PublicMenuMinimal from './PublicMenuMinimal'
import PublicMenuSwipe from './PublicMenuSwipe'
import { useLanguage } from '../context/LanguageContext'

const PublicMenu = () => {
    const { restaurantName, templateKey } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const { t } = useLanguage()

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                let response;
                if (templateKey) {
                    // MODE: Master Template Preview
                    response = await fetch(`/.netlify/functions/templates?templateKey=${templateKey}`)
                } else if (restaurantName) {
                    // MODE: Restaurant Public Menu
                    const decodedName = decodeURIComponent(restaurantName)
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
                                items: result.items || []
                            }
                        }
                    });
                } else {
                    setData(result);
                }
            } catch (err) {
                console.error(err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (restaurantName || templateKey) {
            fetchMenu()
        }
    }, [restaurantName, templateKey])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yum-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">😕 {t('auth.menu.oops')}</h1>
                <p className="text-xl text-gray-400 mb-8">{error}</p>
                <p className="text-gray-500 text-sm">{t('auth.menu.checkUrl')}</p>
            </div>
        )
    }

    if (!data || !data.menu) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">🍽️ {data?.restaurant || 'Restaurant'}</h1>
                <p className="text-xl text-gray-400">{t('auth.menu.noMenu')}</p>
            </div>
        )
    }

    // Branch to specialized templates
    if (data.menu.template_type === 'pizza1' || templateKey === 'pizza1') {
        return <PublicMenuPizza1 restaurantName={restaurantName} />
    }

    if (data.menu?.template_type === 'testemplate' || templateKey === 'testemplate') {
        return <PublicMenuTestemplate restaurantName={restaurantName} />
    }

    if (data.menu?.template_type === 'testemplate2' || templateKey === 'testemplate2') {
        return <PublicMenuTestemplate2 restaurantName={restaurantName} />
    }

    if (data.menu?.template_type === 'magazine' || templateKey === 'magazine') {
        return <PublicMenuMagazine restaurantName={restaurantName} templateKey={templateKey} />
    }

    // Default to Grid or List based on layout preference
    if (data.menu.base_layout === 'swipe') {
        return <PublicMenuSwipe restaurant={data.restaurant} menu={data.menu} config={data.menu.config} />
    }

    if (data.menu.base_layout === 'minimal') {
        return <PublicMenuMinimal restaurant={data.restaurant} menu={data.menu} config={data.menu.config} />
    }

    if (data.menu.base_layout === 'list') {
        return <PublicMenuList restaurant={data.restaurant} menu={data.menu} config={data.menu.config} />
    }

    return <PublicMenuGrid restaurant={data.restaurant} menu={data.menu} config={data.menu.config} />
}

export default PublicMenu
