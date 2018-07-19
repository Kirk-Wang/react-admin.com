const siteConfig = {
  title: 'React-Admin',
  tagline: 'A frontend framework for building admin SPAs on top of REST services, using React and Material Design',
  // url: 'https://kanto-riders.github.io/bonfire/',
  url: '/',
  baseUrl: '/',
  projectName: 'react-admin',
  headerLinks: [
    { doc: 'intro', label: 'Doc' },
    // { page: 'help', label: 'Help' },
    // { blog: true, label: 'Blog' },
    // { href: 'https://github.com/kanto-riders/bonfire/', label: 'GitHub' },
    { search: true }
  ],

  /* On page navigation for the current documentation page */
  onPageNav: 'separate',

  // users,
  headerIcon: 'img/icon_common.png',
  footerIcon: 'img/icon_common.png',
  favicon: 'img/favicon/favicon.ico',
  colors: {
    primaryColor: '#272e37',
    secondaryColor: '#232930'
  },
  copyright: 'Copyright © ' + new Date().getFullYear() + 'React-Admin',
  organizationName: 'Kirk-Wang',
  highlight: {
    theme: 'default'
  },
  scripts: ['https://buttons.github.io/buttons.js'],
  repoUrl: 'https://github.com/Kirk-Wang/react-admin.com.git'
  // gaTrackingId: 'UA-113151047-1'
}

module.exports = siteConfig
