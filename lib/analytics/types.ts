export type SiteVersion = "existing" | "preview" | "production";

export type LabName = "Pike" | "Peak" | "Pacific" | "Network";

export type LeadType =
  | "general_contact"
  | "new_account"
  | "partner_interest"
  | "ownership_interest"
  | "meeting_request"
  | "sales_inquiry"
  | "customer_service"
  | "other";

type CommonEventParameters = {
  lab_name?: LabName;
  site_version?: SiteVersion;
};

export type AnalyticsEventMap = {
  page_view: CommonEventParameters & {
    page_location: string;
    page_path: string;
    page_title: string;
  };
  generate_lead: CommonEventParameters & {
    lead_type: LeadType;
    form_name: string;
    page_location: string;
    page_title: string;
    traffic_context: string;
  };
  open_account: CommonEventParameters & {
    destination_url: string;
    source_page: string;
  };
  partner_inquiry: CommonEventParameters & {
    partner_type: string;
    source_page: string;
  };
  schedule_meeting: CommonEventParameters & {
    meeting_type: string;
    destination_url: string;
    source_page: string;
  };
  click_phone: CommonEventParameters & {
    phone_number: string;
    source_page: string;
  };
  click_email: CommonEventParameters & {
    email_address: string;
    source_page: string;
  };
  portal_login_click: CommonEventParameters & {
    destination_url: string;
    source_page: string;
  };
  resource_search: CommonEventParameters & {
    search_term?: string;
    search_term_length: number;
    search_result_count: number;
    resource_category: string;
    brand_filter: string;
  };
  resource_filter: CommonEventParameters & {
    brand?: string;
    resource_type?: string;
    product_category?: string;
  };
  resource_view: CommonEventParameters & {
    resource_name: string;
    resource_type: string;
    brand: string;
    product: string;
    destination_url: string;
  };
  resource_download: CommonEventParameters & {
    file_name: string;
    file_extension: string;
    resource_name: string;
    brand?: string;
    product?: string;
    source_page: string;
  };
  newsletter_view: CommonEventParameters & {
    content_title: string;
    content_category: string;
    author?: string;
    publish_date?: string;
  };
  outbound_click: CommonEventParameters & {
    destination_domain: string;
    destination_url: string;
    link_text: string;
    source_page: string;
  };
};

export type AnalyticsEventName = keyof AnalyticsEventMap;

export type DataLayerValue = string | number | boolean | null | undefined;

export type DataLayerEvent = {
  event: AnalyticsEventName | "analytics_context";
} & Record<string, DataLayerValue>;
