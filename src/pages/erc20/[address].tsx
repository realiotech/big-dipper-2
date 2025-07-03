import Erc20Details from "@/components/erc20/details";
import { useTokenRecoil } from "@/recoil/erc20/hooks";

const Erc20Page = () => {
  // Initialize token loading (this will load all tokens if not already loaded)
  useTokenRecoil();

  return (
    <Erc20Details />
  );
};

export default Erc20Page;
