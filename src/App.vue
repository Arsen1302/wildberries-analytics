<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <div class="header-content">
          <div class="logo-section">
            <h1 class="app-title">Wildberries Analytics</h1>
            <p class="app-subtitle">Панель управления продажами</p>
          </div>
          <nav class="main-nav">
            <RouterLink to="/incomes" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                <path d="M9 3v6M15 3v6M3 9h6M3 15h6"/>
              </svg>
              Поступления
            </RouterLink>
            <RouterLink to="/orders" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Заказы
            </RouterLink>
            <RouterLink to="/sales" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 1 1-4 0v-6m4 0V9a2 2 0 1 0-4 0v4.01"/>
              </svg>
              Продажи
            </RouterLink>
            <RouterLink to="/stocks" class="nav-link">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              Запасы
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <main class="app-main">
      <div class="container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6) 0;
  gap: var(--space-8);
}

.logo-section {
  flex-shrink: 0;
}

.app-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--line-height-tight);
}

.app-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
  margin: var(--space-1) 0 0 0;
  font-weight: var(--font-weight-normal);
}

.main-nav {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.nav-link:hover {
  color: var(--primary-600);
  background: var(--primary-50);
  border-color: var(--primary-200);
}

.nav-link.router-link-active {
  color: var(--primary-700);
  background: var(--primary-100);
  border-color: var(--primary-300);
  box-shadow: var(--shadow-sm);
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  padding: var(--space-8) 0;
  background: var(--bg-secondary);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
    padding: var(--space-4) 0;
  }

  .main-nav {
    width: 100%;
    justify-content: center;
    gap: var(--space-1);
  }

  .nav-link {
    flex: 1;
    justify-content: center;
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-xs);
  }

  .nav-icon {
    width: 14px;
    height: 14px;
  }

  .app-title {
    font-size: var(--font-size-xl);
  }

  .app-main {
    padding: var(--space-6) 0;
  }
}

@media (max-width: 480px) {
  .main-nav {
    flex-direction: column;
    gap: var(--space-2);
  }

  .nav-link {
    flex: none;
    justify-content: flex-start;
  }
}
</style>
