"use client";
import { currentCardsInformation } from "@/atoms/editDemo";
import { useAtom } from "jotai";
import { useEffect, useState } from "react"

interface PointerItem {
    x: number;
    y: number;
    content: string;
    imgUrl: string;
}


function Preview() {


    const [cursorPoints, setCursorPoints] = useState<PointerItem[]>([])
    const [cardIndex, setCardIndex] = useState(0)
    const [pointsIndex, setPointsIndex] = useState(0)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [currentCardsInfo, setCurrentCardsInfo] = useAtom(currentCardsInformation)

    useEffect(() => {
        console.log("currentCardsInfo", currentCardsInfo)
        if (currentCardsInfo?.data?.length && cardIndex < currentCardsInfo.data.length) {
            // Extract pointers from the current card's pointersInfo
            const currentCard = currentCardsInfo.data[cardIndex]
            if (currentCard?.pointersInfo?.length) {
                const pointers = currentCard.pointersInfo.map((pointer: any) => ({
                    x: pointer.y, // y as top position (percentage number)
                    y: pointer.x, // x as left position (percentage number)
                    content: pointer.content || "No content",
                    imgUrl: currentCard.imgUrl
                }))
                setCursorPoints(pointers)
            } else {
                setCursorPoints([])
            }
        } else {
            setCursorPoints([])
        }

    }, [currentCardsInfo, cardIndex])
    const handleNextEvent = () => {
        if (cursorPoints.length === 0) return
        
        // Check if at last pointer
        if (pointsIndex >= cursorPoints.length - 1) {
            // Check if more cards available
            if (currentCardsInfo?.data && cardIndex < currentCardsInfo.data.length - 1) {
                // Move to next card
                setCardIndex(prev => prev + 1)
                setPointsIndex(0)
            } else {
                // Loop back to first card
                setCardIndex(0)
                setPointsIndex(0)
            }
        } else {
            // Move to next pointer in current card
            setPointsIndex(prev => prev + 1)
        }
    }

    return (
        <>

            <div className="w-full   flex items-center justify-center ">

                <div className="w-[70%] relative flex items-center justify-center">

                    <img src={currentCardsInfo?.data?.[cardIndex]?.imgUrl} onLoad={() => setImageLoaded(true)} />

                    {imageLoaded && cursorPoints.length > 0 && (
                        <div className="z-[30] flex-col items-center transform transition-transform duration-1000 ease-out" style={{ "position": "absolute", "top": `${cursorPoints[pointsIndex]?.x}%`, "left": `${cursorPoints[pointsIndex]?.y}%` }}>
                            <div className="w-[18px] h-[18px] mb-3 rounded-full bg-[#FF5555] flex items-center justify-center">
                                <div className="w-[20px] h-[20px] rounded-full bg-[#FF937E] animate-ping" />
                            </div>
                            <div key={`${cursorPoints[pointsIndex]?.content}-${pointsIndex}`} onClick={handleNextEvent} className="min-w-[60px] content-fade-in bg-blue-600 rounded-lg h-fit cursor-pointer hover:scale-110 transform transition-transform duration-300 ease-out" >
                                <p className="2xl:text-xl text-white font-normal p-1 select-none ">{cursorPoints[pointsIndex]?.content}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Preview