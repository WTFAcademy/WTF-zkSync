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
                 <dt>Execute transaction: </dt>
                 <dd className="text-gray-900">{transaction}</dd>
             </div>
             <div className="flex justify-between">
                 <dt>Transaction fee: </dt>
                 <dd className="text-gray-900">{gas} ETH</dd>
             </div>
             <div className="flex justify-between">
                 <dt>Gas price: </dt>
                 <dd className="text-gray-900">{gasPrice} ETH</dd>
             </div>

             {!nonGas && (
                 <div className="flex justify-between text-gray-900 text-base border-t border-border pt-6">
                     <dt>Actual payment:</dt>
                     <dd>{cost} ETH</dd>
                 </div>
             )}

             {nonGas && (
                 <>
                     <div className="flex items-center justify-between text-gray-900">
                         <dt>Estimated cost (original):</dt>
                         <dd>{cost} ETH</dd>
                     </div>

                     <div className="flex justify-between text-gray-900 text-base border-t border-border pt-6">
                         <dt>Actual payment: </dt>
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
