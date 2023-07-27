import { FC, Fragment, useState } from "react";
import TransactionDialogContent from "./TransactionDialogContent";
import { Operation, RouteResponse } from "@/solve";
import { Asset } from "@/cosmos";
import { Chain } from "@/context/chains";
import { ActionType } from "@/solve/form";

export interface Route {
  amountIn: string;
  amountOut: string;
  sourceAsset: Asset;
  sourceChain: Chain;
  destinationAsset: Asset;
  destinationChain: Chain;
  actionType: ActionType;
  operations: Operation[];
  transactionCount: number;
  rawRoute: RouteResponse;
}

interface Props {
  route?: Route;
  insufficientBalance?: boolean;
}

const TransactionDialog: FC<Props> = ({ route, insufficientBalance }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <div>
        <button
          className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
          disabled={!route}
          onClick={() => setIsOpen(true)}
        >
          Preview Route
        </button>
        {isOpen && (
          <div className="absolute inset-0 bg-white rounded-3xl z-[999]">
            {route && (
              <TransactionDialogContent
                route={route}
                onClose={() => setIsOpen(false)}
                insufficentBalance={insufficientBalance}
              />
            )}
          </div>
        )}
      </div>
      {/* <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <TransactionDialogTrigger disabled={!route} />
        </DialogTrigger>
        <DialogContent
          onInteractOutside={(event) => {
            event.preventDefault();

            console.log(event.currentTarget);
          }}
        >
          {route && (
            <TransactionDialogContent
              route={route}
              onClose={() => setIsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog> */}
    </Fragment>
  );
};

export default TransactionDialog;
