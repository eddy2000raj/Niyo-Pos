import * as yup from 'yup';
export default interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  gstin: string;
  settings?: {
    wholesaling: boolean;
  };
}

const mobileRegex = /^\+91[6-9]\d{9}$/;
export const CustomerSchema = yup.object().shape({
  first_name: yup.string().nullable(),
  last_name: yup.string().nullable(),
  email: yup.string().email().nullable(),
  //TODO: Update mobile validation regex if any present to cover all numbers
  //Or alternatively use libphonenumber library if it is really important
  mobile: yup
    .string()
    .matches(mobileRegex, 'Mobile Number is invalid')
    .required(),
  gender: yup.string().nullable(),
  age: yup.string().nullable(),
  gstin: yup.string().nullable(),
});
