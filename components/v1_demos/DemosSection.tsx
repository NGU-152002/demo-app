"use client";

import { useAtom } from "jotai"
import Cards from "./Cards"
import { cardsInfomationInterface, cardsInformation, currentCardsInformation } from "@/atoms/editDemo"
import { useEffect } from "react"
import { toast } from "sonner"
import { searchResource } from "@/mongoConnection/mongoApiRequest"
import mongoose from "mongoose"


function DemosSection() {

    const [cardsInfo,setCardsInfo] = useAtom(cardsInformation)

    

    useEffect(()=>{
        console.log("dfasfd",cardsInfo)
    },[cardsInfo])

    useEffect(() => {
        const fetchDemos = async () => {
            try {
                const aggregationPipeline = [
                    // {
                    //     "$match": {
                    //         _id: { $oid: "692b4a41b80c5e8cc015b46e" }
                    //     }
                    // },
                    {
                        "$limit": 1000
                    }
                ]

                const response = await searchResource(process.env.NEXT_PUBLIC_DATABASE || "productDemo", "Demos", aggregationPipeline)

                if (response.status === 'success' && response.data) {
                    const responseData = await (response.data as Response).json()
                    // responseData has: { status, database, collection, data: [...] }
                    if (responseData.data && responseData.data.length > 0) {
                        setCardsInfo(responseData.data || [])
                    }
                }
            } catch (Err) {
                console.error("Failed to fetch user demos", Err)
                toast.error("Something went wrong while fetching demos")
            }
        }

        
        fetchDemos()
    }, [])
    
  return (
    <>
    <div className="p-2 space-y-2.5">
        <p className="2xl:text-2xl font-extrabold">Demos</p>
    <div className="flex flex-wrap gap-x-3 items-center">
        {
            cardsInfo?.map((item:cardsInfomationInterface)=><Cards demoInfo={item} />)
        }
    </div>
   
    </div>
    </>
  )
}

export default DemosSection