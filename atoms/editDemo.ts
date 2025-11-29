import { atom } from "jotai";

export interface cardsInfomationInterface {
    _id?: string;
    tempId?: string;
    title?:string;
    index: number;
    content: string;
    x?: string | number;
    y?: string | number;
    imgUrl?: string;
    isActive?: boolean;
    pointersInfo?: {
        pointerTempId?:string;
        x: string | number;
        y: string | number;
        content?: string;
        isActive?:boolean;
    }[]

}

export const cardsInformation = atom<cardsInfomationInterface[] | []>([])
export const currentCardsInformation = atom<any>(null)