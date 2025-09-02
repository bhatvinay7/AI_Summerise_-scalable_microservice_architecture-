// store/sidebarSlice.ts
import { createSlice, PayloadAction, createAsyncThunk,AsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import getUserDetails  from "../../../utils/userDetails";


interface UserStateInfo {
  username: string
  userId: number | null
  email: string
  token:string|null
  state:Status
}
type Status = "fulfilled" | "loading" | "failed";
const initialState: UserStateInfo = {
  username: "",
  userId: null,
  email: "",
  state:"loading",
  token:null
};
export type GetDetailsAction =
  | ReturnType<typeof getDetails.pending>
  | ReturnType<typeof getDetails.fulfilled>
  | ReturnType<typeof getDetails.rejected>;

const getDetails = createAsyncThunk("getDetails", async (_, thunkAPI)=> {
  try {
    const res = await getUserDetails()
    console.log(res)
    return res as UserStateInfo
  } catch (err: any) {
    console.log(err)
    return thunkAPI.rejectWithValue(err.response?.data || err.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserDetails(state, action: PayloadAction<UserStateInfo>) {
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.email=action.payload.email
    },
    // You can add logout reducer if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDetails.pending, (state) => {
        state.state = 'loading';
      }).addCase(getDetails.fulfilled,
        (state, action: PayloadAction<UserStateInfo>) => {
          console.log(action.payload)
          state.username = action.payload.username;
          state.email = action.payload.email;
          state.userId = action.payload.userId;
          state.token=action.payload.token
          state.state="fulfilled"
        }
      )
      .addCase(getDetails.rejected, (state) => {
        //  state.state = 'failed';
      });
  },
});

// Selectors
export const userInfo = (state: RootState) => state.user
export   {getDetails}

 
// Actions
export const { setUserDetails } = userSlice.actions;

// Reducer
export default userSlice.reducer;
