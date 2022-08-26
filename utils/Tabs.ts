const Tabs = [
  {
    label: 'SELL',
    icon: 'fas fa-cash-register',
    link: '/',
    protected: true,
  },
  {
    label: 'ORDERS',
    icon: 'fas fa-book',
    link: '/orders',
    protected: true,
  },
  {
    label: 'REPORTS',
    icon: 'fas fa-grin-stars',
    link: '/reports',
    protected: true,
  },
  {
    label: 'PAY',
    icon: 'fas fa-credit-card',
    link: '/pay',
    protected: true,
  },
  {
    label: 'SHIPMENTS',
    icon: 'fas fa-truck',
    link: '/shipments',
    protected: true,
  },
  {
    label: 'LEDGER',
    icon: 'fas fa-file-invoice-dollar',
    link: '/ledger',
    protected: true,
  },
  {
    label: 'SUPPORT',
    icon: 'fas fa-question-circle',
    link: '/support',
    protected: true,
  },
];

export default Tabs;
