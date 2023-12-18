import { DisconnectOutlined } from "@ant-design/icons";
import { Button, Flex, Space } from "antd"
import { useAddress } from "src/hooks/useAddress";
import { useAccount, useDisconnect } from "wagmi"
import { FaEthereum } from "react-icons/fa";
export const Header = () => {
    const { getShortAddress, getObjectExplorerURL } = useAddress();
    const { disconnect } = useDisconnect()
    const { address } = useAccount();
    return (
        <Flex justify="space-between" style={{marginBottom: 10}}>
            <Button size="large" icon={<FaEthereum />}>WETH-USDM</Button>
            <Space>
                <Button size="large" type="primary" onClick={() => window.open(getObjectExplorerURL(address), "_blank")}>{getShortAddress(address)}</Button>
                <Button icon={<DisconnectOutlined />} size="large" onClick={() => disconnect()} title="disconnect"></Button>
            </Space>
        </Flex>
    )
}