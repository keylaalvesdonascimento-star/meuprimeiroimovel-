import { UserData, Property } from '../types';
import { BROKER_PHONE_NUMBER } from '../constants';
import { formatCurrency } from '../utils/formatting';

export const generateWhatsAppLink = (userData: UserData, property: Property): string => {
  const greeting = `Olá, sou ${userData.name}`;
  const interest = `tenho interesse no imóvel *${property.title}* (Ref: ${property.id})`;
  const incomeInfo = `Minha renda bruta declarada é ${formatCurrency(userData.income)}`;
  const closing = `Podemos conversar sobre o financiamento?`;

  const message = `${greeting} e ${interest}.\n\n${incomeInfo}.\n\n${closing}`;
  
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${BROKER_PHONE_NUMBER}?text=${encodedMessage}`;
};