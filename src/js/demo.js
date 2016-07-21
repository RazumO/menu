(function () {
  var menuElement = document.getElementsByClassName('js-menu')[0],
    bottomMenuElement = document.getElementsByClassName('js-menu-bottom')[0]
    menuItems = [
      {
        title: 'Toys (n/a)',
        disabled: true,
        clickHandler: function () {
          alert('You click Toys item!');
        }
      }, {
        title: 'Books'
      }, {
        title: 'Clothing',
        clickHandler: function () {
          alert('You click Clothing item!');
        }
      },
      {
        title: 'Electronics',
        subItems: [
          {
            title: 'Home Entertainment',
            disabled: true
          },
          {
            title: 'Car Hifi'
          },
          {
            title: 'Utilities'
          }
        ]
      },
      {
        title: 'Movies'
      },
      {
        title: 'Music',
        subItems: [
          {
            title: 'Rock',
            subItems: [
              {
                title: 'Alternative'
              },
              {
                title: 'Classic'
              }
            ]
          },
          {
            title: 'Jazz',
            subItems: [
              {
                title: 'Freejazz'
              },
              {
                title: 'Big Band'
              },
              {
                title: 'Modern'
              }
            ]
          },
          {
            title: 'Pop'
          }
        ]
      },
      {
        title: 'Specials (n/a)',
        disabled: true
      }
    ],
    menuOptions = {
      elementToBind: menuElement,
      itemsTree: menuItems
    },
    bottomMenuOptions = {
      elementToBind: bottomMenuElement,
      itemsTree: menuItems
    },
    menu = new window.Menu(),
    bottomMenu = new window.Menu();

  menu.init(menuOptions);
  bottomMenu.init(bottomMenuOptions);

}());