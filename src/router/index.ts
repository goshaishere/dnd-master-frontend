import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MapsView from '@/views/MapsView.vue'
import MapEditView from '@/views/MapEditView.vue'
import CharactersView from '@/views/CharactersView.vue'
import BestiaryView from '@/views/BestiaryView.vue'
import SessionsView from '@/views/SessionsView.vue'
import SessionPlayView from '@/views/SessionPlayView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
    history: createWebHistory(
        import.meta.env.BASE_URL),
    routes: [{
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/maps',
            name: 'maps',
            component: MapsView
        },
        {
            path: '/maps/new',
            name: 'map-new',
            component: MapEditView
        },
        {
            path: '/maps/:id',
            name: 'map-edit',
            component: MapEditView,
            props: true
        },
        {
            path: '/characters',
            name: 'characters',
            component: CharactersView
        },
        {
            path: '/bestiary',
            name: 'bestiary',
            component: BestiaryView
        },
        {
            path: '/sessions',
            name: 'sessions',
            component: SessionsView
        },
        {
            path: '/sessions/:id/play',
            name: 'session-play',
            component: SessionPlayView,
            props: true
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsView
        }
    ],
})

export default router