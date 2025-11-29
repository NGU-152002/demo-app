import { cardsInfomationInterface, cardsInformation } from "@/atoms/editDemo"
import { useAtom } from "jotai"
import { useRef, useState } from "react"
import { createResource } from "@/mongoConnection/mongoApiRequest"
import { toast } from "sonner"

/*

Future: Adding videos, will need timeline

*/
function MainContent() {

    const [cardsInfo, setCardsInfo] = useAtom(cardsInformation)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0, xPercent: 0, yPercent: 0 })

    // Find the active card
    const activeCard = cardsInfo.find(card => card.isActive)


        const randomId = () => {
        return Math.random().toString(36).substring(2, 9);
    }


    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const pixelX = e.clientX - rect.left
        const pixelY = e.clientY - rect.top

        // Calculate percentages
        const percentX = (pixelX / rect.width) * 100
        const percentY = (pixelY / rect.height) * 100

        setClickPosition({ x: pixelX, y: pixelY, xPercent: percentX, yPercent: percentY })

        // Update card with percentage values
        if (activeCard) {
            setCardsInfo((prev: cardsInfomationInterface[]) =>
                prev.map((item: cardsInfomationInterface) =>
                    item.tempId === activeCard.tempId
                        ? {
                            ...item,
                            pointersInfo:[
                                ...(item.pointersInfo?.map((temp:any)=>({...temp,isActive:false})) || []),
                                {
                                    pointerTempId:randomId(),
                                    x:percentX,
                                    y:percentY,
                                    content:"",
                                    isActive:true
                                }
                            ]

                        }
                        :item
                )
            )
        }

        console.log(`Click Position - Pixels: X: ${pixelX.toFixed(2)}, Y: ${pixelY.toFixed(2)} | Percentage: X: ${percentX.toFixed(2)}%, Y: ${percentY.toFixed(2)}%`)
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !activeCard) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const imageUrl = event.target?.result as string

            // Update the imgUrl of the active card
            setCardsInfo((prev: any) =>
                prev.map((item: any) =>
                    item.tempId === activeCard.tempId
                        ? { ...item, imgUrl: imageUrl }
                        : item
                )
            )
        }
        reader.readAsDataURL(file)
    }

    const handleUploadClick = () => {
        if (!activeCard) {
            alert("Please select a card first")
            return
        }
        fileInputRef.current?.click()
    }

    const handleRemoveImg = () => {

        setCardsInfo((prev: cardsInfomationInterface[]) => prev.map((item: cardsInfomationInterface) => item.tempId == activeCard?.tempId ? {
            ...item,
            imgUrl: "",
            pointersInfo:[]
        } : item))
    }



    return (
        <>
            <div className="h-full flex items-center justify-center space-y-2.5 p-4">

                {activeCard?.imgUrl ? (
                    <div
                        ref={containerRef}
                        onClick={handleContainerClick}
                        className="w-[95%] relative aspect-video flex items-center justify-center cursor-pointer m-3 rounded-xl border-3 border-white overflow-hidden"
                    >
                        <img
                            src={activeCard.imgUrl}
                            alt="Selected"
                            className="w-full h-full object-contain"
                        />

                        {/* Display all pointers */}
                        {activeCard?.pointersInfo?.filter((active:any)=>active?.isActive == true)?.map((pointer: any) => (
                            <div
                                key={pointer.pointerTempId}
                                className="absolute flex flex-col items-center transform transition-transform duration-1000 ease-out"
                                style={{
                                    left: `${pointer.x}%`,
                                    top: `${pointer.y}%`,
                                    transform: "translate(-50%, -50%)"
                                }}
                            >
                                {/* Pointer dot */}
                                {/* <div
                                    onClick={(e)=>e.stopPropagation()}
                                    className={`w-5 h-5 rounded-full border-2 border-white shadow-lg ${
                                        pointer.isActive ? "bg-blue-500" : "bg-red-500"
                                    }`}
                                /> */}

                                <div onClick={(e)=>e.stopPropagation()} className="w-[18px] h-[18px] mb-3 rounded-full bg-[#FF5555] flex items-center justify-center">
                                    <div className="w-[20px] h-[20px] rounded-full bg-[#FF937E] animate-ping" />
                                </div>

                                {/* Pointer content label */}
                                {pointer.content && (
                                    <div onClick={(e)=>e.stopPropagation()} className="mt-2  h-fit select-none bg-black/70 text-white px-3 py-1 rounded-md text-sm">
                                        <p className="2xl:text-sm break-words max-w-32">{pointer.content}</p>
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="absolute bottom-5 left-5 bg-black/70 text-white px-3 py-2 rounded text-sm space-y-1">
                            <div>Pixels: X: {clickPosition.x.toFixed(0)}, Y: {clickPosition.y.toFixed(0)}</div>
                            <div>Percent: X: {clickPosition.xPercent.toFixed(2)}%, Y: {clickPosition.yPercent.toFixed(2)}%</div>
                        </div>

                        <p
                            className="absolute 2xl:text-lg bg-red-400 hover:bg-red-600 text-white cursor-pointer font-medium rounded-md right-10 top-5 p-1"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveImg()
                            }}
                        >Delete</p>

                    </div>
                ) : (
                    <div
                        onClick={handleUploadClick}
                        className="w-[95%] aspect-video flex items-center justify-center cursor-pointer m-3 border-3 border-white rounded-xl border-dotted hover:bg-white/10 transition-colors"
                    >
                        <p className="2xl:text-2xl font-bold">+ Upload image here</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />



            </div>
        </>
    )
}

export default MainContent