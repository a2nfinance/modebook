import { readContract, waitForTransaction, writeContract } from "@wagmi/core";
import { Button, Card, Col, Flex, Form, Input, Row, Space, notification } from "antd";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import erc20ABI from "src/abis/erc20.json";
import pairABI from "src/abis/pair.json";
import { contractAddresses } from "src/configs/contractAddresses";
import { useAccount, useNetwork } from "wagmi";
export const OrderForm = () => {
    const [api, contextHolder] = notification.useNotification();
    const { address } = useAccount();
    const { chain } = useNetwork();
    const [ethSize, setEthSize] = useState(null);
    const [usdSize, setUsdSize] = useState(null);
    const [limitPrice, setLimitPrice] = useState(null);
    const [buying, setBuying] = useState(false);
    const [selling, setSelling] = useState(false);
    const handleChangeEth = useCallback((value) => {
        setEthSize(value);
        if (limitPrice) {
            setUsdSize(value * limitPrice)
        }
    }, [ethSize])

    const handleChangeUsd = useCallback((value) => {
        setUsdSize(value)
        if (limitPrice) {
            setEthSize(parseFloat((value / limitPrice).toFixed(3)))
        }
    }, [usdSize])

    const handleChangeLimitPrice = useCallback((value) => {
        setLimitPrice(value)
        if (usdSize) {
            setEthSize(parseFloat((usdSize / value).toFixed(3)))
        } else {
            if (ethSize) {
                setUsdSize(parseFloat((ethSize * value).toFixed(2)))
            }

        }
    }, [limitPrice])

    const handleSell = useCallback(async () => {
        try {
            if (!limitPrice || !ethSize) {
                return;
            }
            setSelling(true);
            console.log(ethSize, usdSize, limitPrice);
            const floorPriceInCents = Math.floor(limitPrice * 100);
            let priceIndex = null;
            // Check price index
            try {
                priceIndex = await readContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "getIndexOfPrice",
                    account: address,
                    args: [floorPriceInCents]
                })
            } catch (e) {
                priceIndex = null;
                console.log(e.message)
            }


            if (priceIndex === null) {
                // New price index
                const { hash: newIndexHash } = await writeContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "initBookNode",
                    account: address,
                    args: [floorPriceInCents],
                })
                await waitForTransaction({
                    hash: newIndexHash
                })

                priceIndex = await readContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "getIndexOfPrice",
                    account: address,
                    args: [floorPriceInCents]
                })

            }

            // Approve
            const { hash: approveHash } = await writeContract({
                //@ts-ignore
                address: contractAddresses.weth,
                chainId: chain?.id,
                abi: erc20ABI,
                functionName: "approve",
                account: address,
                args: [contractAddresses.pair, ethers.utils.parseUnits(ethSize.toString())]
            })
            await waitForTransaction({
                hash: approveHash
            })
            // New buy order
            const { hash: sellOrderHash } = await writeContract({
                //@ts-ignore
                address: contractAddresses.pair,
                chainId: chain?.id,
                abi: pairABI,
                functionName: "newSellOrder",
                account: address,
                args: [floorPriceInCents, ethers.utils.parseUnits(ethSize.toString()), priceIndex] // 16: because the price has been converted to cents (price x 100)
            })

            await waitForTransaction({
                hash: sellOrderHash
            })
            api.open({
                type: "success",
                message: 'Create a sell order',
                description:
                    'Create a sell order successful!'
            })
        } catch (e) {
            api.open({
                type: "error",
                message: 'Create a sell order',
                description:
                    'Fail to create a sell order!'
            })
            console.log(e)
        }
        setSelling(false);
    }, [ethSize, usdSize, limitPrice, selling, address])

    const handleBuy = useCallback(async () => {
        try {
            if (!limitPrice || !ethSize) {
                return;
            }
            setBuying(true);
            console.log(ethSize, usdSize, limitPrice);
            const floorPriceInCents = Math.floor(limitPrice * 100);
            let priceIndex = null;
            // Check price index
            try {
                priceIndex = await readContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "getIndexOfPrice",
                    account: address,
                    args: [floorPriceInCents]
                })
            } catch (e) {
                priceIndex = null;
                console.log(e.message)
            }


            if (priceIndex === null) {
                // New price index
                const { hash: newIndexHash } = await writeContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "initBookNode",
                    account: address,
                    args: [floorPriceInCents],
                })
                await waitForTransaction({
                    hash: newIndexHash
                })

                priceIndex = await readContract({
                    //@ts-ignore
                    address: contractAddresses.pair,
                    chainId: chain?.id,
                    abi: pairABI,
                    functionName: "getIndexOfPrice",
                    account: address,
                    args: [floorPriceInCents]
                })

            }

            // Approve
            const { hash: approveHash } = await writeContract({
                //@ts-ignore
                address: contractAddresses.usdm,
                chainId: chain?.id,
                abi: erc20ABI,
                functionName: "approve",
                account: address,
                args: [contractAddresses.pair, ethers.utils.parseUnits((limitPrice * ethSize).toFixed(2), 18)]
            })
            await waitForTransaction({
                hash: approveHash
            })
            // New buy order
            const { hash: buyOrderHash } = await writeContract({
                //@ts-ignore
                address: contractAddresses.pair,
                chainId: chain?.id,
                abi: pairABI,
                functionName: "newBuyOrder",
                account: address,
                args: [floorPriceInCents, ethers.utils.parseUnits(ethSize.toString()), priceIndex] // 16: because the price has been converted to cents (price x 100)
            })

            await waitForTransaction({
                hash: buyOrderHash
            })
            api.open({
                type: "success",
                message: 'Create a buy order',
                description:
                    'Create a buy order successful!'
            })
        } catch (e) {
            api.open({
                type: "error",
                message: 'Create a buy order',
                description:
                    'Fail to create a buy order!'
            })
            console.log(e)
        }
        setBuying(false);
    }, [ethSize, usdSize, limitPrice, buying, address])

    return (
        <Card title={"Limit"} style={{ height: "455px" }}>
            {contextHolder}
            <Form layout="vertical">
                <Row gutter={12}>
                    <Col span={12}>
                        <Form.Item label="WETH">
                            <Input size="large" type="number" onChange={(e) => handleChangeEth(e.target.value)} value={ethSize} placeholder="0.000" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="USDM">
                            <Input size="large" type="number" value={usdSize} onChange={(e) => handleChangeUsd(e.target.value)} placeholder="0.00" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Limit Price">
                            <Input size="large" type="number" value={limitPrice} onChange={(e) => handleChangeLimitPrice(e.target.value)} placeholder="0.00" suffix="USDM" />
                        </Form.Item>
                    </Col>

                </Row>
            </Form>
            <Space direction="vertical" style={{ width: "100%", marginTop: 70, backgroundColor: "#000000", borderRadius: 15 }}>
                <Flex justify="space-between" style={{ padding: "2px 5px" }}>
                    <span>Fee (0.1%)</span> <span>{usdSize ? (usdSize * 0.001).toFixed(2) : "N/A"} USD</span>
                </Flex>
                <Flex justify="space-between" style={{ padding: "2px 5px" }}>
                    <span>Order value</span> <span>{usdSize ? (usdSize * 0.999).toFixed(2) : "N/A"} USD</span>
                </Flex>
                <Flex justify="space-between">
                    <Button size="large" type="primary" loading={selling} onClick={() => handleSell()} style={{ width: "49%" }}>SELL</Button>
                    <Button size="large" type="primary" loading={buying} onClick={() => handleBuy()} style={{ width: "49%" }}>BUY</Button>
                </Flex>
            </Space>

        </Card>
    )
}