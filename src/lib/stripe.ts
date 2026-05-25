import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = 'pk_test_51T8T8O5iG9eT9v5LseXe90ydRzygrjw66CpNlM88T3YZGR7lnH0sub3FNoa0x4okzl5aryZuVNSZ0CsEq1qmveOU00c0BqeJVV';

export const stripePromise = loadStripe(stripePublishableKey);
