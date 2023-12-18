import { Alert, Button, Card, Col, Row, Space, TabsProps, Typography } from "antd";
import { useEffect, useState } from "react";
import Chart from "src/components/Chart";
import { ExtraButtons } from "src/components/ExtraButtons";
import { Main } from "src/components/Main";
// import { setAccounts } from "src/controller/account/accountSlice";
import { useAppDispatch, useAppSelector } from "src/controller/hooks";
// import { getAccounts } from "src/core/account";
import { ConnectWalletStyle } from "src/styles/wallet";
import {
    useAccount,
    useConnect,
} from 'wagmi';

const { Title, Text } = Typography;
export default function Index() {
    const [client, setClient] = useState(false);
    const { address, isConnected } = useAccount()
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()

    useEffect(() => {
        setClient(true);
    }, [address])


    if (isConnected && client) {
        return (
            <Row gutter={2} style={{ height: "100%", padding: 10, boxSizing: "border-box" }}>

                <Col span={16}>
                    <Chart />
                </Col>
                <Col span={8}>


                    <Main />

                </Col>


            </Row>

        )
    }

    return (
        client && <>
            <Alert style={{ borderRadius: 0, border: 0, textAlign: "center" }} type="info" message={
                <Text>
                    Welcome to ModeBook! You can use this application for testing on the Sepolia.Mode testnet.
                </Text>
            } />
            <Card
                //@ts-ignore
                style={ConnectWalletStyle}>
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={3}>MODEBOOK</Title>
                    <Text>Simplified Trading, Empowered Users – Explore Decentralized Exchange with Mode Orderbook.</Text>
                    {connectors.map((connector) => (
                        <Button
                            style={{ width: "100%" }}
                            size="large"
                            type="primary"
                            disabled={!connector.ready}
                            key={connector.id}
                            loading={isLoading &&
                                connector.id === pendingConnector?.id}
                            onClick={() => connect({ connector })}
                        >
                            {!connector?.ready ? `${connector?.name} (unsupported)` : connector?.name}
                        </Button>
                    ))}

                    {error && <Alert type="error" message={error.message} showIcon />}
                </Space>
            </Card>
        </>
    )
}