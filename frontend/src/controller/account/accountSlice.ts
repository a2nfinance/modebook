import { PayloadAction, createSlice } from "@reduxjs/toolkit";
export type Account = {
    _id?: string,
    wallet_address: string,
    onemes_name: string,
    onemes_account_address: string,
    chain: string,
    email: string,
    phone_number: string,
    twitter: string,
    telegram: string,
    use_wallet_address_to_receive: boolean,
    status: number,
    created_at: string
}

type AccountState = {
    accounts: Account[],
    selectedAccount: Account,
    tokenList: any[]
}

const initialState: AccountState = {
    accounts: [],
    selectedAccount: {
        wallet_address: "",
        onemes_name: "",
        onemes_account_address: "",
        chain: "",
        email: "",
        phone_number: "",
        twitter: "",
        telegram: "",
        use_wallet_address_to_receive: false,
        status: 1,
        created_at: "2023-12-20"
    },
    tokenList: [
        {
            loading: true,
            tokenSymbol: "",
            tokenName: "",
            tokenQuantity: 0,
            tokenInUsd: 0

        },
        {
            loading: true,
            tokenSymbol: "",
            tokenName: "",
            tokenQuantity: 0,
            tokenInUsd: 0
        },
    ]
}
export const accountSlice = createSlice({
    name: 'account',
    initialState: initialState,
    reducers: {
        setAccounts: (state: AccountState, action: PayloadAction<any[]>) => {
            state.accounts = action.payload;
            if (action.payload.length) {
                console.log(action.payload);
                state.selectedAccount = action.payload[0]
            }
        },
        setSelectedAccount: (state: AccountState, action: PayloadAction<Account>) => {
            state.selectedAccount = action.payload
        },
        setTokenList: (state: AccountState, action: PayloadAction<any[]>) => {
            console.log(action.payload);
            state.tokenList = action.payload
        }
    }
})
export const { setAccounts, setSelectedAccount, setTokenList } = accountSlice.actions;
export default accountSlice.reducer;