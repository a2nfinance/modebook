import { Card, Col, Divider, Flex, Form, Row } from "antd"
import { ActiveOrders } from "./ActiveOrders"
import { OrderBook } from "./OrderBook"
import { OrderForm } from "./OrderForm"
import { Header } from "./Header"

export const Main = () => {
    return (
        <Card style={{borderRadius: 0, height: "100%"}} >
            <Row gutter={8}>
                <Col span={24}>
                    <Header/>
                </Col>
                <Col span={12}>
                    <OrderForm />
                </Col>
                <Col span={12}>
                    <OrderBook />
                </Col>
                <Divider/>
                <Col span={24}>
                    <ActiveOrders />
                </Col>
            </Row>
        </Card>


    )
}