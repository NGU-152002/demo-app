import { useState } from "react"
import { cardsInfomationInterface, cardsInformation } from "@/atoms/editDemo"
import { useAtom } from "jotai"
import DeleteIcon from "@mui/icons-material/Delete"
import { Loader } from "lucide-react"
import { toast } from "sonner"
import { createResource } from "@/mongoConnection/mongoApiRequest"


function EditDetails() {

    const [cardsInfo, setCardsInfo] = useAtom(cardsInformation)
    const [isLoading, setIsLoading] = useState(false)

    const handleChangePointer = (data: any, item: any) => {
        setCardsInfo((prev: any) =>
            prev.map((items: any) =>
                items?.tempId == item?.tempId
                    ? {
                        ...items,
                        pointersInfo: items.pointersInfo.map((pointer: any) =>
                            pointer.pointerTempId === data.pointerTempId
                                ? { ...pointer, isActive: true }
                                : { ...pointer, isActive: false }
                        )
                    }
                    : items
            )
        )
    }

    const handlePointerContentChange = (pointerTempId: string, item: any, e: any) => {
        setCardsInfo((prev: any) =>
            prev.map((items: any) =>
                items?.tempId == item?.tempId
                    ? {
                        ...items,
                        pointersInfo: items.pointersInfo.map((pointer: any) =>
                            pointer.pointerTempId === pointerTempId
                                ? { ...pointer, content: e.target.value }
                                : pointer
                        )
                    }
                    : items
            )
        )
    }

    const handleDeletePointer = (pointerTempId: any, item: any) => {

        setCardsInfo((prev: any) =>
            prev.map((items: any) =>
                items.tempId == item.tempId ?
                    {
                        ...items,
                        pointersInfo: items.pointersInfo.filter((pointer: any) =>
                            pointer.pointerTempId != pointerTempId
                        )
                    } : items
            )

        )

    }

    const handleSubmit = async () => {
        if (cardsInfo.length === 0) {
            toast.error("No cards to save")
            return
        }

        setIsLoading(true)
        try {
            const response = await createResource('productDemo', 'Demos', { data: cardsInfo })
            if (response && response.status === 'success') {
                toast.success("Demo created successfully")
                setCardsInfo([])
            } else {
                toast.error("Failed to create demo")
            }
        } catch (error) {
            toast.error("Error creating demo")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-3 space-y-4">

            <p className="2xl:text-xl border-b border-black">Edit</p>
                            <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-[95%] bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                    {isLoading && (
                        <Loader className="w-5 h-5 animate-spin" />
                    )}
                    {isLoading ? 'Submitting...' : 'Submit Demo'}
                </button>

            <div className="space-y-2.5">

                {
                    cardsInfo.filter((item: cardsInfomationInterface) => item.isActive == true).map((item: cardsInfomationInterface, index: number) => (
                        <>
                            <div className="space-y-6">
                                <div className="space-y-2 h-[70vh] overflow-y-auto">

                                    <p className="2xl:text-lg font-semibold">Pointers</p>

                                    {
                                        item?.pointersInfo?.map((data: any, index: number) => (
                                            <div
                                                key={data?.pointerTempId}
                                                className={`min-h-10 p-2 rounded-lg flex justify-between select-none cursor-pointer transition-colors ${data.isActive ? "bg-blue-500 text-white font-semibold" : "bg-white"
                                                    }`}
                                            // onClick={() => { handleChangePointer(data, item) }}
                                            >
                                                <p
                                                    className="2xl:text-lg w-full h-full "
                                                    onClick={() => { handleChangePointer(data, item) }}
                                                >{data?.content ? data?.content : `#${data?.pointerTempId} pointer`}</p>

                                                <DeleteIcon
                                                    onClick={()=>{handleDeletePointer(data?.pointerTempId,item)}}
                                                    className="cursor-pointer hover:text-red-600 transition-colors"
                                                    sx={{ fontSize: 20 }}
                                                />
                                            </div>
                                        ))
                                    }

                                </div>

                                <div className="space-y-2">
                                    <p className="2xl:text-lg font-semibold">Text Content</p>
                                    {item?.pointersInfo?.find((p: any) => p.isActive) ? (
                                        <textarea
                                            value={item.pointersInfo.find((p: any) => p.isActive)?.content || ""}
                                            placeholder="write pointer content here..."
                                            onChange={(e) => {
                                                const activePointer = item.pointersInfo?.find((p: any) => p.isActive)
                                                if (activePointer) {
                                                    handlePointerContentChange(activePointer.pointerTempId || "", item, e)
                                                }
                                            }}
                                            className="h-30 max-h-30 w-[80%] rounded-md bg-white p-2 border border-gray-300"
                                        />
                                    ) : (
                                        <p className="text-gray-500">Select a pointer to edit</p>
                                    )}
                                </div>


                            </div>

                        </>
                    ))
                }



            </div>

        </div>
    )
}

export default EditDetails