import {configureStore} from '@reduxjs/toolkit';
import authReducer from '../features/authSlice'
import meetingReducer from '../features/meetingSlice'

const store = configureStore({
    reducer:{
        auth:authReducer,
        meeting:meetingReducer,
    }
})

export default store;