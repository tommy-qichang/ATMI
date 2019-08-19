import React from 'react';
import {FormErrors} from "./FormErrors";
import styles from './RegistryForm.css'
import axios from 'axios';

class RegistryForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            userEmail: '',
            userPwd: '',
            formErrors: {userEmail: '', userPwd: ''},
            emailValid: false,
            passwordValid: false,
            formValid: false
        };
    };


    handleChange = (event) => {
        this.state.showError = false
        const name = event.target.name;
        const value = event.target.value;
        this.setState({[name]: value},
            () => {
                this.validateField(name, value)
            });
    };

    handleSubmit = (event) => {
        fetch('/users/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: this.state.userName,
                userEmail: this.state.userEmail,
                userPwd: this.state.userPwd
            })
        }).then((response)=>{
            alert('success');
        });

        event.preventDefault();
    };


    validateField = (fieldName, value) => {
        let fieldValidationErrors = this.state.formErrors;
        let emailValid = this.state.emailValid;
        let passwordValid = this.state.passwordValid;

        switch (fieldName) {
            case 'userEmail':
                emailValid = value.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
                fieldValidationErrors.userEmail = emailValid ? '' : ' is invalid';
                break;
            case 'userPwd':
                passwordValid = value.length >= 6;
                fieldValidationErrors.userPwd = passwordValid ? '' : ' is too short';
                break;
            default:
                break;
        }
        this.setState({
            formErrors: fieldValidationErrors,
            emailValid: emailValid,
            passwordValid: passwordValid
        }, this.validateForm);
    };

    validateForm = () => {
        this.setState({formValid: this.state.emailValid && this.state.passwordValid});
    };

    errorClass = (error) => {
        return (error.length === 0 ? '' : 'is-invalid');
    };

    render() {
        return (
            <div className="container">
                <form className={styles.registry} >
                    <h2>Sign up</h2>
                    <div className="panel panel-default">
                        <FormErrors formErrors={this.state.formErrors}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="userName">User Name</label>
                        <input type="text" required className='form-control' name='userName' placeholder='userName'
                               onChange={this.handleChange}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="email">Email address</label>
                        <input type="email" required
                               className={`form-control ${this.errorClass(this.state.formErrors.userEmail)}`}
                               name="userEmail"
                               placeholder="Email"
                               value={this.state.userEmail}
                               onChange={this.handleChange}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="password">Password</label>
                        <input type="password"
                               className={`form-control ${this.errorClass(this.state.formErrors.userPwd)}`}
                               name="userPwd"
                               placeholder="Password"
                               onChange={this.handleChange}/>
                    </div>
                    <button type="submit" className="btn btn-primary" onClick={this.handleSubmit} disabled={!this.state.formValid}>Sign up</button>
                </form>

            </div>
        )
    }
}

export default RegistryForm;



