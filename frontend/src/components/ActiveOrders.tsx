import { Button, Card, Table, notification } from "antd"
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/controller/hooks"
import { useAccount, useNetwork, useWalletClient } from "wagmi";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core"
import pairABI from "src/abis/pair.json";
import { contractAddresses } from "src/configs/contractAddresses";
import { setActiveOrders } from "src/controller/order/activeOrderSlice";
import { BigNumber, ethers } from "ethers";
let interval = null;
export const ActiveOrders = () => {
    const [tableLoading, setTableLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false)
    const [api, contextHolder] = notification.useNotification();
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
        setTableLoading(false);
    }


    const deleteOrder = useCallback(async (record) => {
        try {
            setCancelling(true);
            let priceIndex = null;
            // Check price index
            try {
                priceIndex = await readContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "getIndexOfPrice",
                    args: [record.price]
                })
            } catch (e) {
                priceIndex = null;
                console.log(e.message)
            }
            if (priceIndex !== null) {
                const { hash: deleteOrderHash } = await writeContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: record.type === "BUY" ? "deleteBuyOrder" : "deleteSellOrder",
                    account: address,
                    args: [record.price, record.orderId, priceIndex]
                })
                await waitForTransaction({
                    hash: deleteOrderHash
                })
            }
            api.open({
                type: "success",
                message: 'Delete an order',
                description:
                    'Delete an order successful!'
            })
        } catch (e) {
            api.open({
                type: "error",
                message: 'Delete an order',
                description:
                    'Fail to delete an order!'
            })
            console.log(e)
        }
        setCancelling(false);
    }, [address])
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
            title: 'Size (WETH)',
            dataIndex: 'volume',
            key: 'volume',
            render: (_, record) => {
                if (record.type === "BUY") {
                    return ethers.utils.formatEther(BigNumber.from(record.volume).div(record.price).mul(100).toString())
                } else {
                    return ethers.utils.formatEther(record.volume)
                }
            }
        },
        {
            title: 'Value (USDM)',
            dataIndex: 'value',
            key: 'value',
            render: (_, record) => {
                if (record.type === "BUY") {
                    return ethers.utils.formatEther(record.volume)
                } else {
                    return (record.price / 100 * parseFloat(ethers.utils.formatEther(record.volume))).toFixed(3)
                }
            }
        },
        {
            title: "Actions",
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (<>
                <Button loading={cancelling} onClick={() => deleteOrder(record)}>Cancel</Button>
            </>)
        }
    ];
    return (
        <Card title={"Active Orders"}>
            {contextHolder}
            <Table
                loading={tableLoading}
                pagination={false}
                columns={columns}
                dataSource={activeOrders}
            />
        </Card>
    )
}