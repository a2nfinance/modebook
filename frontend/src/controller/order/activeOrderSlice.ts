import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type State = {
    activeOrders: any[]
}

const initialState: State = {
    activeOrders: []
}
export const activeOrderSlice = createSlice({
    name: 'activeOrder',
    initialState: initialState,
    reducers: {
        setActiveOrders: (state: State, action: PayloadAction<{sellOrders: any[], buyOrders: any[]}>) => {
            const formatedSellOrders = action.payload.sellOrders.map(o => ({
                ...o,
                type: "SELL"
            }))

            const formatedBuyOrders = action.payload.buyOrders.map(o => ({
                ...o,
                type: "BUY"
            }))
          
            state.activeOrders = [...formatedSellOrders, ...formatedBuyOrders];
            console.log("ACTIVE ORDERS:", state.activeOrders);
        },
    }
})
export const { setActiveOrders} = activeOrderSlice.actions;
export default activeOrderSlice.reducer;