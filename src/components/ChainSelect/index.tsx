import { FC, Fragment, useState } from "react";

import { Chain } from "@/api/queries";
import { Dialog, DialogContent, DialogTrigger } from "@/elements/Dialog";

import ChainSelectContent from "./ChainSelectContent";
import ChainSelectTrigger from "./ChainSelectTrigger";

interface Props {
  chain?: Chain;
  chains: Chain[];
  onChange?: (chain: Chain) => void;
}

const ChainSelect: FC<Props> = ({ chain, chains, onChange = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <ChainSelectTrigger chain={chain} />
        </DialogTrigger>
        <DialogContent>
          <ChainSelectContent
            chains={chains}
            onChange={(_chain) => {
              onChange(_chain);
              setIsOpen(false);
            }}
            onClose={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Fragment>
  );
};

export default ChainSelect;
