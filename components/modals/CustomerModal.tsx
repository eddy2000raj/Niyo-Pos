import styled from 'styled-components';
import Modal from '../../layouts/Modal';
import Customer, { CustomerSchema } from '../../types/Customer';
import { ModalProps } from '../ModalManager';
import { FormEvent, useState } from 'react';
import { useDispatch } from 'react-redux';
import CustomerAction from '../../redux/actions/CustomerAction';
import useCart from '../../hooks/useCart';
import Toolkit from '../../utils/Toolkit';
import { reach } from 'yup';
import DB from '../../utils/database/DB';
import { number } from 'yup/lib/locale';

interface Props extends ModalProps {
  customer?: Customer;
  initialValue?: string;
}

const CustomerModal = ({ complete, initialValue }: Props) => {
  const isNum = /^\d+$/.test(initialValue);
  const [firstName, setFirstName] = useState(
    isNum ? '' : initialValue.split(' ')[0]
  );
  const [lastName, setLastName] = useState(
    isNum ? '' : initialValue.split(' ')[1] || ''
  );
  const [mobile, setMobile] = useState(isNum ? initialValue : '');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [errors, setErrors] = useState<{ [prop: string]: string[] }>({});
  const [numberExists, setNumberExists] = useState<boolean>(false);
  const dispatch = useDispatch();
  const customer_already_exist_error =
    'User with same Mobile Number already exist, Kindly use different number';
  const { updateCustomer } = useCart();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const customerMobile = '+91' + mobile;
    const data = {
      first_name: firstName,
      last_name: lastName || null,
      mobile: customerMobile,
      email: email || null,
      gender: gender,
      age: age,
      gstin: gstin,
    };
    const errors = Toolkit.validate(CustomerSchema, data);
    if (numberExists) {
      setErrors({ ...errors, mobile: [customer_already_exist_error] });
    } else {
      setErrors(errors);
    }

    if (Object.keys(errors).length == 0 && !numberExists) {
      const customer: any = await dispatch(CustomerAction.create(data));
      updateCustomer(customer);
      complete();
    }
  };

  const blurred = async (name: string, value: string) => {
    const { [name]: deletedErrors, ...newErrors } = errors;
    let inputErrors = Toolkit.validate(reach(CustomerSchema, name), value);

    if (name === 'mobile' && Object.keys(inputErrors).length === 0) {
      await DB.customers
        .where({ mobile: value })
        .count()
        .then(count => {
          if (count && count > 0) {
            setNumberExists(true);
            inputErrors = {
              ...inputErrors,
              0: customer_already_exist_error,
            };
          } else {
            setNumberExists(false);
          }
        });
    }

    if (inputErrors) newErrors[name] = inputErrors;
    setErrors(newErrors);
  };

  return (
    <Modal>
      <h1 className="title">Create Customer</h1>
      <form className="mt-lg" onSubmit={submit}>
        <div className="grid gutter-md">
          <div className="col-12">
            <label className="label">Mobile</label>
            <div className="input-group">
              <div className="icon">
                <span>+91</span>
              </div>
              <input
                type="tel"
                className="input"
                name="mobile"
                value={mobile}
                onBlur={() => blurred('mobile', '+91' + mobile)}
                onChange={e => setMobile(e.target.value)}
              />
            </div>
            <span className="error">
              {errors.mobile ? errors.mobile[0] : null}
            </span>
          </div>
          <div className="col-6">
            <label className="label">First Name</label>
            <input
              type="text"
              className="input"
              name="first_name"
              value={firstName}
              onBlur={() => blurred('first_name', firstName)}
              onChange={e => setFirstName(e.target.value)}
            />
            <span className="error">
              {errors.first_name ? errors.first_name[0] : null}
            </span>
          </div>
          <div className="col-6">
            <label className="label">Last Name</label>
            <input
              type="text"
              className="input"
              name="last_name"
              value={lastName}
              onBlur={() => blurred('last_name', lastName)}
              onChange={e => setLastName(e.target.value)}
            />
            <span className="error">
              {errors.last_name ? errors.last_name[0] : null}
            </span>
          </div>
          <div className="col-6">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              name="email"
              value={email}
              onBlur={() => blurred('email', email)}
              onChange={e => setEmail(e.target.value)}
            />
            <span className="error">
              {errors.email ? errors.email[0] : null}
            </span>
          </div>
          <div className="col-6">
            <label className="label">GSTIN</label>
            <input
              type="text"
              className="input"
              name="gstin"
              value={gstin}
              onBlur={() => blurred('gstin', gstin)}
              onChange={e => setGstin(e.target.value)}
            />
            <span className="error">
              {errors.gstin ? errors.gstin[0] : null}
            </span>
          </div>
          <div className="col-6">
            <label className="label">Gender</label>
            <select
              name="gender"
              className="input"
              onChange={e => setGender(e.target.value)}
              onBlur={() => blurred('gender', gender)}
            >
              <option>--Select--</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <span className="error">
              {errors.gender ? errors.gender[0] : null}
            </span>
          </div>
          <div className="col-6">
            <label className="label">Age</label>
            <select
              name="age"
              className="input"
              onChange={e => setAge(e.target.value)}
              onBlur={() => blurred('age', age)}
            >
              <option>--Select--</option>
              <option value="0 - 15">0 - 15</option>
              <option value="16 - 20">16 - 20</option>
              <option value="21 - 25">21 - 25</option>
              <option value="26 - 35">26 - 35</option>
              <option value="36 - 45">36 - 45</option>
              <option value="46 +">46 +</option>
            </select>
            <span className="error">{errors.age ? errors.age[0] : null}</span>
          </div>
        </div>
        <div className="mt-lg right">
          <button className="btn btn-lg btn-green">CREATE</button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
