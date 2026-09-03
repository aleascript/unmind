import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    'rules',
    {
      type: 'category',
      label: 'Booklets',
      link: {type: 'doc', id: 'booklets'},
      items: ['veiller', 'servir', 'plaire', 's-effacer', 'ordonner', 'resister'],
    },
  ],
};

export default sidebars;
