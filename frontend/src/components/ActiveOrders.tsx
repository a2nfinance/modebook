import { Button, Card, Table } from "antd"
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "src/controller/hooks"
import { useAccount, useNetwork, useWalletClient } from "wagmi";
import { readContract } from "@wagmi/core"
import pairABI from "src/abis/pair.json";
import { contractAddresses } from "src/configs/contractAddresses";
import { setActiveOrders } from "src/controller/order/activeOrderSlice";
import { BigNumber, ethers } from "ethers";
let interval = null;
export const ActiveOrders = () => {
    const { address } = useAccount();
    const { data: walletClient } = useWalletClient()
    const { chain } = useNetwork();
    const { activeOrders } = useAppSelector(state => state.activeOrder);
    const dispatch = useAppDispatch();

    const fetchActiveOrders = async (address: `0x${string}`) => {
        const buyOrders = await readContract({
            //@ts-ignore
            address: contractAddresses.pair,
            chainId: chain?.id,
            abi: pairABI,
            functionName: "activeBuyOrders",
            account: address
        })

        const sellOrders = await readContract({
            //@ts-ignore
            address: contractAddresses.pair,
            chainId: chain?.id,
            abi: pairABI,
            functionName: "activeSellOrders",
            account: address
        })
        // @ts-ignore
        dispatch(setActiveOrders({ buyOrders: buyOrders, sellOrders: sellOrders }))

    }
    useEffect(() => {
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(function () {
            fetchActiveOrders(address)
        }, 4000)
    }, [address])


    const columns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                if (type === "SELL") {
                    return <span style={{ color: "red" }}>{type}</span>
                } else {
                    return <span style={{ color: "#3a2ad3" }}>{type}</span>
                }
            }
        },
        {
            title: 'Price (USD)',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => (price / 100),
        },
        {
            title: 'Size (ETH)',
            dataIndex: 'volume',
            key: 'volume',
            render: (_, record) => {
                if (record.type === "BUY") {
                    return ethers.utils.formatEther(BigNumber.from(record.volume).div(record.price / 100).toString())
                } else {
                    return ethers.utils.formatEther(record.volume)
                }
            }
        },
        {
            title: 'Value (USD)',
            dataIndex: 'value',
            key: 'value',
            render: (_, record) => {
                if (record.type === "BUY") {
                    return ethers.utils.formatEther(record.volume)
                } else {
                    return record.price / 100 * parseFloat(ethers.utils.formatEther(record.volume))
                }
            }
        },
        {
            title: "Actions",
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (<>
                <Button>Cancel</Button>
            </>)
        }
    ];
    return (
        <Card title={"Active Orders"}>
            <Table
                pagination={false}
                columns={columns}
                dataSource={activeOrders}
            />
        </Card>
    )
}