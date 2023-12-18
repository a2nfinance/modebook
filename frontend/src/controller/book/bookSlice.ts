import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { BigNumber } from "ethers";

type State = {
    sellOB: any[],
    buyOB: any[]
}

const initialState: State = {
    sellOB: [],
    buyOB: []
}

export const bookSlice = createSlice({
    name: 'book',
    initialState: initialState,
    reducers: {
        setBooks: (state: State, action: PayloadAction<{sellOB: any[], buyOB: any[]}>) => {
            console.log(action.payload)
            state.buyOB = action.payload.buyOB.filter(o => BigNumber.from(o.volume).gt(0));
            state.sellOB = action.payload.sellOB.filter(o => BigNumber.from(o.volume).gt(0));
        },
    }
})
export const { setBooks} = bookSlice.actions;
export default bookSlice.reducer;