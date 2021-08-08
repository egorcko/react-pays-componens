import { Component, createRef, RefObject } from "react";

declare global {
  interface Window {
    google: any;
  }
}

interface GooglePayParams {
  merchantName: string;
  gateway: string;
  environment?: "TEST" | "PRODUCTION";
  apiVersion?: number;
  apiVersionMinor?: number;
  gatewayMerchantId?: string;
  networks?: string[];
  authMethods?: string[];
  currencyCode?: string;
  countryCode?: string;
  merchantId?: string;
}

interface GooglePayProps {
  className?: string;
  buttonColor?: "black" | "white";
  buttonSizeMode?: "static" | "fill";
  onPaymentSuccess: (data: PaymentData) => void;
  amount: string;
  params: GooglePayParams;
}

interface BaseCardPaymentMethod {
  type: "CARD";
  parameters: {
    allowedAuthMethods: string[];
    allowedCardNetworks: string[];
  };
}

type TokenizationType = "PAYMENT_GATEWAY";

interface PaymentMethodData {
  type: string;
  description: string;
  tokenizationData: {
    type: TokenizationType;
    token: JSON;
  };
}

export interface PaymentData extends BaseRequestParams {
  paymentMethodData: PaymentMethodData;
}

interface BaseRequestParams {
  apiVersion: number;
  apiVersionMinor: number;
}

interface PaymentRequestParams extends BaseRequestParams {
  allowedPaymentMethods: CardPaymentMethod[];
  merchantInfo: {
    merchantName: string;
    merchantId: string;
  };
  transactionInfo: {
    totalPriceStatus: "FINAL";
    totalPrice: string;
    countryCode: string;
    currencyCode: string;
  };
}

interface CardPaymentMethod extends BaseCardPaymentMethod {
  tokenizationSpecification: {
    type: TokenizationType;
    parameters: {
      gateway: string;
      gatewayMerchantId: string;
    };
  };
}

interface ReadyToPayRequest extends BaseRequestParams {
  allowedPaymentMethods: BaseCardPaymentMethod[];
}

interface ReadyToPayResponse {
  result: boolean;
}

interface Config {
  baseRequest: BaseRequestParams;
  cardPaymentMethod: CardPaymentMethod;
}

const defaultCardNetworks = ["MASTERCARD", "VISA"];
const defaultCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

export default class GooglePay extends Component<GooglePayProps> {
  config: Config;
  paymentsClient: any;
  container: RefObject<HTMLDivElement>;
  constructor(props: GooglePayProps) {
    super(props);

    this.container = createRef();

    this.config = {
      baseRequest: {
        apiVersion: props.params?.apiVersion ?? 2,
        apiVersionMinor: props.params?.apiVersionMinor ?? 0,
      },
      cardPaymentMethod: {
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: props.params?.gateway as string,
            gatewayMerchantId:
              props.params?.gatewayMerchantId ?? "exampleGatewayMerchantId",
          },
        },
        ...this.getBaseCardPaymentMethod(),
      },
    };

    this.createButton = this.createButton.bind(this);
    this.handleClickButton = this.handleClickButton.bind(this);
  }

  componentDidMount() {
    if (typeof window !== "undefined") {
      this.includeScript().then(() => {
        console.info(
          "%c Google Pay script was loaded successfully",
          "color: green;"
        );
        this.initPaymentClient();
      });
    }
  }

  initPaymentClient() {
    this.paymentsClient = new window.google.payments.api.PaymentsClient({
      environment: this.props.params.environment ?? "TEST",
    });
    this.paymentsClient
      .isReadyToPay(this.getReadyToPayRequest())
      .then(this.createButton)
      .catch((error: any) => console.error(error));
  }

  includeScript() {
    const script = document.querySelector("#google-pay-script");
    if (script) script.remove();
    return new Promise<void>((resolve) => {
      let s = document.createElement("script");
      s.id = "google-pay-script";
      s.src = "https://pay.google.com/gp/p/js/pay.js";
      s.async = false;
      s.type = "text/javascript";
      s.onload = () => {
        resolve();
      };
      document.getElementsByTagName("head")[0].appendChild(s);
    });
  }

  handleClickButton() {
    this.paymentsClient
      .loadPaymentData(this.getPaymentRequestData())
      .then(this.props.onPaymentSuccess)
      .catch((err: any) => {
        console.error(err);
      });
  }

  createButton(response: ReadyToPayResponse) {
    if (response.result) {
      const { buttonColor = "default", buttonSizeMode = "static" } = this.props;
      const button = this.paymentsClient.createButton({
        buttonColor,
        buttonSizeMode,
        onClick: this.handleClickButton,
      });
      this.container.current?.appendChild(button);
    }
  }

  getPaymentRequestData(): PaymentRequestParams {
    return {
      allowedPaymentMethods: [this.config.cardPaymentMethod],
      merchantInfo: {
        merchantName: this.props.params?.merchantName,
        merchantId: this.props.params?.merchantId ?? "TEST merchantId",
      },
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: this.props.amount,
        countryCode: this.props.params?.countryCode ?? "RU",
        currencyCode: this.props.params?.currencyCode ?? "RUB",
      },
      ...this.config.baseRequest,
    };
  }

  getBaseCardPaymentMethod(): BaseCardPaymentMethod {
    return {
      type: "CARD",
      parameters: {
        allowedAuthMethods:
          this.props.params?.authMethods ?? defaultCardAuthMethods,
        allowedCardNetworks: this.props.params?.networks ?? defaultCardNetworks,
      },
    };
  }

  getReadyToPayRequest(): ReadyToPayRequest {
    return {
      allowedPaymentMethods: [this.getBaseCardPaymentMethod()],
      ...this.config.baseRequest,
    };
  }

  render() {
    const { className } = this.props;
    return <div id="google-pay" ref={this.container} className={className} />;
  }
}
