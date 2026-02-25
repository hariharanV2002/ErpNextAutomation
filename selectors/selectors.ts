const loginSelectors = {
  emailInput: [
    'input[type="email"]:visible',
    'input[placeholder*="Email" i]:visible',
    'input#login_email:visible',
    'input[name="login_email"]'
  ],
  passwordInput: [
    'input[type="password"]:visible',
    'input[placeholder*="Password" i]:visible',
    'input#login_password:visible',
    'input[name="login_password"]'
  ],
  submitButton: [
    'button:has-text("Login")',
    'button:has-text("Sign in")',
    'button:has-text("Verify")'
  ]
} as const;

const itemListSelectors = {
  addItemButton: ['button:has-text("Add Item")', 'a:has-text("Add Item")'],
  searchIdInput: [
    'input[data-fieldname="name"]',
    'input[placeholder="ID"]',
    'input[aria-label="ID"]'
  ],
  clearFiltersButton: [
    'button:has-text("Filters") + button',
    'button[aria-label="Clear Filters"]',
    '.filter-x-button',
    '.list-filters button:has-text("x")'
  ],
  tableRow: ['.result-list .list-row', '.dt-row', '[data-name] .list-row']
} as const;

const manufacturerListSelectors = {
  addManufacturerButton: ['button:has-text("Add Manufacturer")', 'a:has-text("Add Manufacturer")'],
  searchShortNameInput: [
    'input[data-fieldname="short_name"]',
    'input[aria-label="Short Name"]',
    'input[placeholder="Short Name"]'
  ],
  tableRow: ['.result-list .list-row', '.dt-row', '[data-name] .list-row']
} as const;

const itemManufacturerListSelectors = {
  addItemManufacturerButton: ['button:has-text("Add Item Manufacturer")', 'a:has-text("Add Item Manufacturer")'],
  searchPartNumberInput: [
    'input[data-fieldname="manufacturer_part_no"]',
    'input[aria-label="Manufacturer Part Numb"]',
    'input[placeholder="Manufacturer Part Numb"]'
  ],
  tableRow: ['.result-list .list-row', '.dt-row', '[data-name] .list-row']
} as const;

const purchaseItemPriceListSelectors = {
  addItemPriceButton: ['button:has-text("Add Item Price")', 'a:has-text("Add Item Price")'],
  searchItemCodeInput: [
    'input[data-fieldname="item_code"]',
    'input[aria-label="Item Code"]',
    'input[placeholder="Item Code"]'
  ],
  tableRow: ['.result-list .list-row', '.dt-row', '[data-name] .list-row']
} as const;

const itemFormSelectors = {
  pageHeader: [
    'h3:has-text("New Item")',
    'h1:has-text("New Item")',
    '.modal-title:has-text("New Item")'
  ],
  editFullFormButton: ['button:has-text("Edit Full Form")', 'a:has-text("Edit Full Form")'],
  fullFormIndicator: ['a:has-text("Inventory")', 'button:has-text("Duplicate")'],
  activeModal: ['.modal.show', '[role="dialog"]'],
  saveButton: [
    'button:has-text("Save")',
    'a:has-text("Save")',
    '.modal-dialog .btn-primary',
    '.primary-action:has-text("Save")'
  ],
  modalSaveButton: ['button:has-text("Save")', 'a:has-text("Save")', '.btn-primary'],
  itemCodeInput: [
    'input[data-fieldname="item_code"]',
    'label:has-text("Item Code") + div input'
  ],
  itemNameInput: [
    'input[data-fieldname="item_name"]',
    'label:has-text("Item Name") + div input'
  ],
  itemGroupInput: [
    'input[data-fieldname="item_group"]',
    'label:has-text("Item Group") + div input'
  ],
  revisionInput: [
    'input[data-fieldname="revision_number"]',
    '[data-fieldname="revision_number"] input',
    'div.form-group:has(label:has-text("Revision Number")) input',
    'input[aria-label="Revision Number"]',
    'label:has-text("Revision Number") + div input'
  ],
  builtTypeSelect: [
    'select[data-fieldname="item_type"]',
    'label:has-text("Built Type") + div select'
  ],
  hsnInput: [
    'input[data-fieldname="gst_hsn_code"]',
    'label:has-text("HSN/SAC") + div input'
  ]
} as const;

const manufacturerFormSelectors = {
  saveButton: ['button:has-text("Save")', '.primary-action:has-text("Save")'],
  shortNameInput: [
    'input[data-fieldname="short_name"]',
    'label:has-text("Short Name") + div input'
  ],
  fullNameInput: [
    'input[data-fieldname="full_name"]',
    'label:has-text("Full Name") + div input'
  ],
  websiteInput: [
    'input[data-fieldname="website"]',
    'label:has-text("Website") + div input'
  ]
} as const;

const itemManufacturerFormSelectors = {
  saveButton: ['button:has-text("Save")', '.primary-action:has-text("Save")'],
  itemCodeInput: [
    'input[data-fieldname="item_code"]',
    'label:has-text("Item Code") + div input'
  ],
  manufacturerInput: [
    'input[data-fieldname="manufacturer"]',
    'label:has-text("Manufacturer") + div input'
  ],
  manufacturerPartNumberInput: [
    'input[data-fieldname="manufacturer_part_no"]',
    'label:has-text("Manufacturer Part Number") + div input'
  ]
} as const;

const purchaseItemPriceFormSelectors = {
  saveButton: ['button:has-text("Save")', '.primary-action:has-text("Save")'],
  itemCodeInput: [
    'input[data-fieldname="item_code"]',
    'label:has-text("Item Code") + div input'
  ],
  priceListInput: [
    'input[data-fieldname="price_list"]',
    'label:has-text("Price List") + div input'
  ],
  supplierInput: [
    'input[data-fieldname="supplier"]',
    'label:has-text("Supplier") + div input'
  ],
  customerInput: [
    'input[data-fieldname="customer"]',
    'label:has-text("Customer") + div input'
  ],
  uomInput: [
    'input[data-fieldname="uom"]',
    'label:has-text("UOM") + div input'
  ],
  priceListRateInput: [
    'input[data-fieldname="price_list_rate"]',
    'label:has-text("Price List Rate") + div input'
  ]
} as const;

const commonSelectors = {
  dialogTitle: ['.modal-title', '[role="dialog"] .title-text', '.msgprint h4'],
  dialogBody: ['.modal-body', '.msgprint .modal-body', '[role="dialog"] .modal-body'],
  dialogClose: ['[role="dialog"] .btn-modal-close', '[role="dialog"] button.close', '[role="dialog"] .modal-header button'],
  toast: ['.toast-message', '.notifications .alert', '.notification-message', '.frappe-alert'],
  autocompleteOption: [
    '.awesomplete ul li',
    '.ui-autocomplete li',
    '.link-option',
    '[role="listbox"] [role="option"]',
    '[role="option"]'
  ]
} as const;

const templates = {
  autocompleteOptionByText: (value: string): string =>
    `${commonSelectors.autocompleteOption.join(', ')}:has-text("${value}")`,
  dialogBodyByText: (text: string): string =>
    `.modal-body:has-text("${text}"), [role="dialog"] :text("${text}")`,
  dialogTitleByText: (text: string): string =>
    `.modal-title:has-text("${text}"), [role="dialog"] :text("${text}")`,
  listRowByText: (value: string): string =>
    `.list-row:has-text("${value}")`,
  rowByCells: (valueA: string, valueB: string): string =>
    `.list-row:has-text("${valueA}"):has-text("${valueB}")`,
  textLocator: (value: string): string =>
    `text=${value}`,
  visibleTextLocator: (value: string): string =>
    `:text("${value}")`
} as const;

export const selectors = {
  login: loginSelectors,
  itemList: itemListSelectors,
  manufacturerList: manufacturerListSelectors,
  itemManufacturerList: itemManufacturerListSelectors,
  purchaseItemPriceList: purchaseItemPriceListSelectors,
  itemForm: itemFormSelectors,
  manufacturerForm: manufacturerFormSelectors,
  itemManufacturerForm: itemManufacturerFormSelectors,
  purchaseItemPriceForm: purchaseItemPriceFormSelectors,
  common: commonSelectors,
  templates
} as const;

export type SelectorKeyGroup = keyof typeof selectors;
