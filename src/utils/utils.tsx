import { jwtDecode } from 'jwt-decode'
import { actions } from 'astro:actions';

export async function getAccessToken() : Promise<{ accessToken: string, success: boolean }> {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
        console.log('No access token found');
        return { accessToken: "" , success: false };
    }

    const decoded = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000; // current time in seconds
    
    if (decoded.exp && decoded.exp < currentTime) {
        console.log('Token has expired');
        const refreshToken = localStorage.getItem("refresh_token");
        
        if (!refreshToken) {
            console.log('No refresh token found');
            return { accessToken: "" , success: false };
        }

        const refreshData = new FormData();
        refreshData.append("refresh", refreshToken);
        
        const { data, error } = await actions.refreshToken(refreshData);

        if (error) {
            console.log('Error refreshing token:', error);
            return { accessToken: "" , success: false };
        }

        localStorage.setItem("access_token", data);

        return { accessToken: data.access , success: true };;
    }

    return { accessToken, success: true };
}