import { currentCardsInformation } from "@/atoms/editDemo"
import { useAtom } from "jotai"
import { useRouter } from "next/navigation"


function Cards({demoInfo}:any) {

    const router = useRouter()
        const [currentCardsInfo,setCurrentCardsInfo] = useAtom(currentCardsInformation)

    const handleSetPreview = ()=>{
        setCurrentCardsInfo(demoInfo)
        router.push("/v1")
    }

  return (
    <div onClick={handleSetPreview} className="w-[20%] aspect-video">

        <div  className="group relative w-full h-full rounded-xl overflow-hidden cursor-pointer">

            <img src={demoInfo?.data?.[0]?.imgUrl} alt={"Test"} className="w-full h-full object-cover"/>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />

            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 2xl:text-lg text-white z-10">{demoInfo?.title}</p>

        </div>

    </div>
  )
}

export default Cards