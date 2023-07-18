import { FC, Fragment, useState } from "react";
import TransactionDialogTrigger from "./TransactionDialogTrigger";
import { Dialog, DialogContent, DialogTrigger } from "@/elements/Dialog";
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
}

const TransactionDialog: FC<Props> = ({ route }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <TransactionDialogTrigger disabled={!route} />
        </DialogTrigger>
        <DialogContent onInteractOutside={(event) => event.preventDefault()}>
          {route && (
            <TransactionDialogContent
              route={route}
              onClose={() => setIsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default TransactionDialog;
