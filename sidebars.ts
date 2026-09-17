import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    'rules',
    {
      type: 'category',
      label: 'Booklets',
      link: {type: 'doc', id: 'booklets'},
      items: ['watch', 'serve', 'please', 'fade', 'order', 'resist'],
    },
    {
      type: 'link',
      label: 'Publications',
      href: '/publications/',
    },
  ],
};

export default sidebars;
