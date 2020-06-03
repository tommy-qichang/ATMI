import React from 'react';
import {Button, Form, Icon, Input, message} from 'antd';
import styles from '../../styles/LoginForm.css';
import axios from "axios";

class ResetPasswordForm extends React.Component {

    state = {
        disableButton: true,
        userName:""
    };

    onPasswordChange = e => {
        if (e.target.value.length >= 6) {
            this.setState({
                disableButton: false
            });
        } else {
            this.setState({
                disableButton: true
            });
        }
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.validate(values);
            }
        });
    }

    validate(values) {
        let email = this.props.username;
        if(ATMI_STATUS.ini_admin){
            email = this.state.userName;
        }
        axios.put("/user/", {
            email: email,
            password: values.password
        }).then(res => {
            const status = eval(res.data);
            if (status) {
                this.username = this.props.username;
                message.success("Successfully reset password！", 2);
                this.props.onResetPasswordSucceed();
                // this.checkLogin();
            } else {
                message.error('Cannot reset password!');
            }
        }).catch(error => {
            message.error('Login failed, please contact admin.');
        })

    }
    onUsernameUpdate = e=>{
        let user = e.target.value;
        this.setState({userName:user})
        // this.setProps({username:user});
        // this.props.username = user;

    }

    render() {
        const {getFieldDecorator} = this.props.form;
        let userInfo = <strong>{this.props.username}</strong>;
        if(ATMI_STATUS.ini_admin){
            userInfo = <input type="input" autoComplete="off" value={this.state.userName} onChange={this.onUsernameUpdate} />
        }
        return (
            <div className={styles.background}>
                <Form onSubmit={this.handleSubmit} className={styles.loginForm} style={{margin: 1}}
                      autoComplete="off" /* style={{backgroundColor: "#fff"}} */>
                    <Form.Item>
                        <label className={styles.font}>Username:
                            {userInfo}
                        </label>
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            rules: [{required: true, message: 'Please input your password'},
                                {min: 6, max: 16, message: 'Please enter your password (6-16 characters)'}
                            ],
                        })(
                            <Input
                                prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                type="password"
                                placeholder="Reset password (6-16 characters)"
                                maxLength={16}
                                onChange={this.onPasswordChange}
                                autoComplete="off"
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" ghost className={styles.loginFormButton}
                                disabled={this.state.disableButton}>
                            Reset password
                        </Button>
                        {/*   已有账号？ <a href="javascript:;" onClick={this.props.onLoginButtonClick}>去登陆</a> */}
                    </Form.Item>
                </Form>
            </div>
        );
    }
}

const WrappedNormalResetPasswordForm = Form.create({name: 'normal_resetPassword'})(ResetPasswordForm);
export default WrappedNormalResetPasswordForm;