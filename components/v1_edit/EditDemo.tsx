"use client"

import { cardsInfomationInterface, cardsInformation } from "@/atoms/editDemo"
import { useAtom } from "jotai"
import MainContent from "./MainContent"
import EditDetails from "./EditDetails"
import { useEffect } from "react"



function EditDemo() {

    const [cardsInfo, setCardsInfo] = useAtom(cardsInformation)


    const randomId = () => {
        return Math.random().toString(36).substring(2, 9);
    }

    const handleSelectCard = (tempId:string) =>{
        setCardsInfo((prev:any)=>prev.map((item:cardsInfomationInterface)=>
            item?.tempId == tempId
                ? {...item, isActive:true}
                : {...item, isActive:false}
        ))
    }


useEffect(()=>{
    console.log("dasfdasw",cardsInfo)
},[cardsInfo])


    const handleAddCard = () => {

        setCardsInfo(prev =>
            [...prev, {
                tempId:randomId(),
                index: cardsInfo.length == 0 ? 0 : cardsInfo.length - 1,
                content: `test ${Math.random()}`,
                imgUrl: "",
                x: "150px",
                y: "150px",
                isActive:false

            }])
    }

    return (
        <>
            <div className="w-full h-[100vh] grid grid-cols-[0.25fr_1fr_0.3fr]">

                {/* steps */}
                <div className="bg-amber-300 w-full p-2 flex items-center">
                
                <div className=" space-y-2.5  max-w-[15vw] w-[15vw] h-[95vh] overflow-y-auto">

                    {
                        cardsInfo.map((items: cardsInfomationInterface, index: number) => (
                            <div
                            key={index}
                             className={`border-2   aspect-video cursor-pointer rounded-lg ${items.isActive ? "border-white" : ""} `}
                            onClick={()=>{handleSelectCard(items.tempId || "")}}                       
                            >
                                <p className="2xl:text-sm break-words" >{items.content} {items.tempId}</p>

                            </div>

                        ))
                    }

                    <div
                        className=" border-2 border-dotted h-30 w-full cursor-pointer hover:font-bold flex items-center justify-center rounded-lg"
                        onClick={handleAddCard}
                    >
                        <p className="2xl:text-sm ">+ Add new</p>
                    </div>

                </div>

                </div>

                {/* main content */}
                <div className="bg-blue-300 w-full h-full">
                    <MainContent />
                </div>

                {/* edit details */}
                <div className="bg-green-300">
                   <EditDetails />
                </div>

            </div>
        </>
    )
}

export default EditDemo