import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/authSlice'
import meetingReducer from '../features/meetingSlice'
import notificationReducer from '../features/notificationSlice'

const store = configureStore({
    reducer:{
        auth:authReducer,
        meeting:meetingReducer,
        notifications:notificationReducer
    }
})

export default store;