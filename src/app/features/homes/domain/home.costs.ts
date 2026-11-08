import { Home } from './home.model';

/** Known listing costs only; unknown charges are never assumed to be zero. */
export function homeCosts(home: Home) {
  const monthly = home.price + home.fees;
  const deposit = home.deposit ?? null;
  return {
    monthly,
    deposit,
  };
}
