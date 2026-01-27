import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PublicMenuPizza1 from './PublicMenuPizza1'
import PublicMenuTestemplate from './PublicMenuTestemplate'
import PublicMenuTestemplate2 from './PublicMenuTestemplate2'
import PublicMenuTestemplate3 from './PublicMenuTestemplate3'
import PublicMenuGrid from './PublicMenuGrid'
import PublicMenuList from './PublicMenuList'
import PublicMenuMagazine from './PublicMenuMagazine'
import PublicMenuMinimal from './PublicMenuMinimal'
import PublicMenuSwipe from './PublicMenuSwipe'

const PublicMenu = () => {
    const { restaurantName, templateKey } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
                <h1 className="text-4xl font-bold mb-4">😕 Oops!</h1>
                <p className="text-xl text-gray-400 mb-8">{error}</p>
                <p className="text-gray-500 text-sm">Check the URL or contact the restaurant.</p>
            </div>
        )
    }

    if (!data || !data.menu) {
        return (
            <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white p-4 text-center">
                <h1 className="text-4xl font-bold mb-4">🍽️ {data?.restaurant || 'Restaurant'}</h1>
                <p className="text-xl text-gray-400">No menu published yet.</p>
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
        return <PublicMenuTestemplate2 restaurantName={restaurantName} menuData={data} />
    }

    if (data.menu?.template_type === 'testemplate3' || templateKey === 'testemplate3') {
        return <PublicMenuTestemplate3 restaurantName={restaurantName} menuData={data} />
    }

    // Dynamic Multi-Layout Selection
    const baseLayout = data.menu.base_layout || 'grid';

    switch (baseLayout) {
        case 'grid': return <PublicMenuGrid restaurantName={restaurantName} templateKey={templateKey} />;
        case 'list': return <PublicMenuList restaurantName={restaurantName} templateKey={templateKey} />;
        case 'magazine': return <PublicMenuMagazine restaurantName={restaurantName} templateKey={templateKey} />;
        case 'minimal': return <PublicMenuMinimal restaurantName={restaurantName} templateKey={templateKey} />;
        case 'swipe': return <PublicMenuSwipe restaurantName={restaurantName} templateKey={templateKey} />;
        default: return <PublicMenuGrid restaurantName={restaurantName} templateKey={templateKey} />;
    }
}

export default PublicMenu
