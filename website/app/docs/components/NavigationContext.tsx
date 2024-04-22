import { createContext, useContext } from 'react';

type HandleNavigation = (href: string) => void;

type NavigationContextType = {
  handleNavigation: HandleNavigation;
}

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined);


export const useNavigation = (): HandleNavigation => {
  const context = useContext(NavigationContext);
  if (!context) {
    return () => {};
  }
  return context.handleNavigation
};