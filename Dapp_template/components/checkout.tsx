
type TProps = {
    gas?: string;
    gasPrice?: string;
    cost?: string;
    transaction?: string;
    nonGas?: boolean;
}

const Checkout = (props: TProps) => {
    const { gas, gasPrice, cost, transaction, nonGas } = props;

    return (
        <dl className="space-y-6 text-xs font-medium text-gray-500 border-t border-border pt-4">
            <div className="flex justify-between">
                <dt>执行交易: </dt>
                <dd className="text-gray-900">{transaction}</dd>
            </div>
            <div className="flex justify-between">
                <dt>交易费用: </dt>
                <dd className="text-gray-900">{gas} ETH</dd>
            </div>
            <div className="flex justify-between">
                <dt>Gas价格: </dt>
                <dd className="text-gray-900">{gasPrice} ETH</dd>
            </div>

            {!nonGas && (
                <div className="flex justify-between text-gray-900 text-base border-t border-border pt-6">
                    <dt>实际支付:</dt>
                    <dd>{cost} ETH</dd>
                </div>
            )}

            {nonGas && (
                <>
                    <div className="flex items-center justify-between text-gray-900">
                        <dt>估计费用（原本）:</dt>
                        <dd>{cost} ETH</dd>
                    </div>

                    <div className="flex justify-between text-gray-900 text-base border-t border-border pt-6">
                        <dt>实际支付: </dt>
                        <dd className="space-x-1">
                            <span className="text-xs text-gray-400">(-0 ETH)</span>
                            <span className="text-yellow-600">1 WTF</span>
                        </dd>
                    </div>
                </>
            )}

        </dl>
    )
}

export default Checkout;