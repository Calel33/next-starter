'use client'
import { PricingTable } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"
import { useMemo } from "react"

export default function CustomClerkPricing() {
    const { theme } = useTheme()

    const appearance = useMemo(() => ({
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
            pricingTableCardTitle: { // title
                fontSize: 20,
                fontWeight: 400,
            },
            pricingTableCardDescription: { // description
                fontSize: 14
            },
            pricingTableCardFee: { // price
                fontSize: 36,
                fontWeight: 800,
            },
            pricingTable: {
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            },
        },
    }), [theme])

    return (
        <>
            <PricingTable appearance={appearance} />
        </>
    )
}