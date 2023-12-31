import { Card, Divider, Table } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/controller/hooks";
import { useAccount, useNetwork, useWalletClient } from "wagmi";
import { readContract } from "@wagmi/core";
import pairABI from "src/abis/pair.json";
import { BigNumber, ethers } from "ethers";
import { contractAddresses } from "src/configs/contractAddresses";
import { setBooks } from "src/controller/book/bookSlice";
let interval = null;
export const OrderBook = () => {
    const [tableLoading, setTableLoading] = useState(true);
    const { chain } = useNetwork();
    const { sellOB, buyOB } = useAppSelector(state => state.book);
    const dispatch = useAppDispatch();

    const fetchOrderBooks = async () => {


        const books = await readContract({
            //@ts-ignore
            address: contractAddresses.pair,
            chainId: chain?.id,
            abi: pairABI,
            functionName: "getBookNodes"
        })
        // @ts-ignore
        dispatch(setBooks({ sellOB: books[0], buyOB: books[1] }));
        setTableLoading(false);

    }
    useEffect(() => {
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(function () {
            fetchOrderBooks()
        }, 4000)

    }, [])


    const sellOBColumns = [
        {
            title: 'Price (USD)',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => <span style={{ color: "red" }}>{price / 100}</span>,
        },
        {
            title: 'Size (WETH)',
            dataIndex: 'volume',
            key: 'volume',
            render: (volume: number) => (ethers.utils.formatEther(volume))
        },
    ];

    const buyOBColumns = [
        {
            title: 'Price (USD)',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => <span style={{ color: "#3a2ad3" }}>{price / 100}</span>,
        },
        {
            title: 'Size (WETH)',
            dataIndex: 'volume',
            key: 'volume',
            render: (_, record) => (ethers.utils.formatEther(BigNumber.from(record.volume).div(record.price).mul(100).toString()))
        },
    ];
    return (
        <Card title={"Orderbook (Sell/Buy)"} style={{ height: "455px", overflow: "auto" }}>
            <Table
                loading={tableLoading}
                bordered={false}
                pagination={false}
                columns={sellOBColumns}
                dataSource={sellOB}
                locale={{ emptyText: "No sell data" }}

            />

            <Table
                loading={tableLoading}
                bordered={false}
                showHeader={false}
                pagination={false}
                columns={buyOBColumns}
                dataSource={buyOB}
                locale={{ emptyText: "No buy data" }}
            />
        </Card>
    )
}