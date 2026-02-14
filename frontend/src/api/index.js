import axios from 'axios';
import Cookies from 'js-cookie';

const normalizeBaseUrl = (value) => {
    if (!value) return value;
    return value.endsWith('/') ? value.slice(0, -1) : value;
};

export const API_BASE_URL = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE ||
    (typeof window !== 'undefined'
        ? `http://${window.location.hostname}:8000`
        : 'http://localhost:8000')
);

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

API.interceptors.request.use((req) => {
    const token = Cookies.get('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auth
export const login = (data) => API.post('/token', new URLSearchParams(data), {
    withCredentials: true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
export const signup = (userData) => API.post('/users/', userData, {
    headers: { 'Content-Type': 'application/json' }
});
export const completeGoogleProfile = (data) => API.post('/users/complete-google-profile', data);
export const fetchUser = () => API.get('/users/me/');
export const forgotPassword = (email) => API.post('/forgot-password', { email });
export const resetPassword = (data) => API.post('/reset-password', data);

// Bookings
export const createBooking = (bookingData) => API.post('/bookings/', bookingData);
export const fetchUserBookings = () => API.get('/bookings/');
export const fetchBookingHistory = () => API.get('/bookings/history');
export const fetchAllBookings = () => API.get('/bookings/all');
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);

// Admin
export const fetchAdminBookings = () => API.get('/admin/bookings');
export const adminDeleteBooking = (id) => API.delete(`/admin/bookings/${id}`);
export const fetchAdminUsers = () => API.get('/admin/users');
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const fetchAdminStats = () => API.get('/admin/stats');

// Events
export const fetchEventsVisibility = () => API.get('/events/visibility');
export const fetchPublicEvents = () => API.get('/events');
export const fetchAdminEvents = () => API.get('/admin/events');
export const createAdminEvent = (eventData) => API.post('/admin/events', eventData);
export const deleteAdminEvent = (id) => API.delete(`/admin/events/${id}`);
export const toggleAdminEventActive = (id) => API.put(`/admin/events/${id}/toggle-active`);
export const setEventsVisibility = (show_events_page) =>
    API.put('/admin/events/visibility', { show_events_page });

// Tournaments
export const fetchTournamentsVisibility = () => API.get('/tournaments/visibility');
export const fetchPublicTournaments = () => API.get('/tournaments');
export const fetchPublicTournamentDetails = (id) => API.get(`/tournaments/${id}`);
export const fetchPublicTournamentStandings = (id) => API.get(`/tournaments/${id}/standings`);
export const createTournamentRegistrationRequest = (tournamentId, data) =>
    API.post(`/tournaments/${tournamentId}/registration-requests`, data);
export const fetchMyTournamentRegistrationRequests = () =>
    API.get('/tournaments/my/registration-requests');
export const setTournamentsVisibility = (show_tournaments_page) =>
    API.put('/admin/tournaments/visibility', { show_tournaments_page });
export const fetchAdminTeams = () => API.get('/admin/teams');
export const createAdminTeam = (data) => API.post('/admin/teams', data);
export const addAdminTeamPlayer = (teamId, data) => API.post(`/admin/teams/${teamId}/players`, data);
export const fetchAdminTournaments = () => API.get('/admin/tournaments');
export const createAdminTournament = (data) => API.post('/admin/tournaments', data);
export const deleteAdminTournament = (id) => API.delete(`/admin/tournaments/${id}`);
export const registerTeamInTournament = (tournamentId, data) =>
    API.post(`/admin/tournaments/${tournamentId}/teams/register`, data);
export const fetchTournamentTeamsAdmin = (tournamentId) =>
    API.get(`/admin/tournaments/${tournamentId}/teams`);
export const createTournamentMatchAdmin = (tournamentId, data) =>
    API.post(`/admin/tournaments/${tournamentId}/matches`, data);
export const fetchTournamentMatchesAdmin = (tournamentId) =>
    API.get(`/admin/tournaments/${tournamentId}/matches`);
export const updateMatchResultAdmin = (matchId, data) => API.put(`/admin/matches/${matchId}/result`, data);
export const deleteMatchAdmin = (matchId) => API.delete(`/admin/matches/${matchId}`);
export const fetchTournamentStandingsAdmin = (tournamentId) =>
    API.get(`/admin/tournaments/${tournamentId}/standings`);
export const fetchTournamentRegistrationRequestsAdmin = (status_filter = '') =>
    API.get(`/admin/tournaments/registration-requests${status_filter ? `?status_filter=${status_filter}` : ''}`);
export const approveTournamentRegistrationRequestAdmin = (requestId, admin_notes = '') =>
    API.put(`/admin/tournaments/registration-requests/${requestId}/approve`, { admin_notes });
export const rejectTournamentRegistrationRequestAdmin = (requestId, admin_notes = '') =>
    API.put(`/admin/tournaments/registration-requests/${requestId}/reject`, { admin_notes });

export default API;
