-- Products and Inventory both used a box-shaped icon (BoxIcon vs BoxCubeIcon are the same open
-- box glyph at different sizes/viewBoxes) and were visually indistinguishable in the sidebar.
-- Products now uses a list/catalog icon; Inventory keeps the box (a better fit for "stock").

UPDATE menus SET Icon = 'ListIcon' WHERE Path = '/products';
