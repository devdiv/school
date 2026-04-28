<template>
  <ParentLayout />
</template>

<script setup>
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import { onMounted } from 'vue'

let btn = null
let hidden = false

onMounted(() => {
  // 恢复上次状态
  try {
    hidden = localStorage.getItem('sidebar-hidden') === 'true'
  } catch {}
  
  btn = document.createElement('button')
  btn.id = 'sidebar-toggle-btn'
  btn.innerHTML = '☰'
  btn.title = '隐藏/显示侧边栏'
  btn.style.cssText = `
    position: fixed;
    left: 16px;
    top: 72px;
    z-index: 9999;
    background: #42b883;
    color: #fff;
    border: none;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    opacity: 0.85;
  `
  btn.onmouseenter = () => { btn.style.opacity = '1'; btn.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)' }
  btn.onmouseleave = () => { btn.style.opacity = '0.85'; btn.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)' }
  btn.onclick = () => {
    hidden = !hidden
    const sidebar = document.querySelector('.vp-sidebar') || document.querySelector('.sidebar')
    if (sidebar) {
      sidebar.style.display = hidden ? 'none' : ''
    }
    // 切换按钮图标
    btn.innerHTML = hidden ? '☰' : '☰'
    btn.title = hidden ? '显示侧边栏' : '隐藏侧边栏'
    try { localStorage.setItem('sidebar-hidden', String(hidden)) } catch {}
  }
  document.body.appendChild(btn)
})
</script>
