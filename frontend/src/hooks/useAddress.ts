import { EXPLORER_URL } from "src/configs/contractAddresses";

export const useAddress = () => {
    const getShortAddress = (address: string) => {
        return (
            address.slice(0,7).concat("....").concat(
                address.slice(address.length - 4, address.length)
            )
        )
    };

    const getObjectExplorerURL = (address: string) => {
        return `${EXPLORER_URL}/address/${address}`;
    }
    return { getShortAddress, getObjectExplorerURL };
};