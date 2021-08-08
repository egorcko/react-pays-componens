##### [`Официальная документация Google Pay`](https://developers.google.com/pay/api/web/overview)
Перед началом работы:
* Убедиться что выбранный для оплаты на сайте эквайринг присутствует в [списке](https://developers.google.com/pay/api/web/guides/tutorial#tokenization) поддерживаемых (например, Сбер или Тинькофф)
* Уточнить у службы поддержки своего эквайринга список требований и API-методов для использования Google Pay при оплате. Ответ на данный вопрос может быть в официальной документации эквайринга (рекомендуется сначала ознакомиться с ней)
* Уточнить, зарегистрирован ли магазин (на сайте которого будет подключен функционал `Google Pay`) в качестве продавца в Google (https://pay.google.com/business/console/). 

>`ВАЖНО`
Google Pay не является платежным сервисом. Оплата производится с помощью банка, эквайринг которого используется на сайте. Система Google Pay формирует платежный токен, который проверяет банк, после чего создает транзакцию на списание средств с карты клиента

### Props
#### `className`?: string
CSS класс для стилизации элемента. Стили самой кнопки приходят от Google, поэтому настроить их не получится. Можно только добавить внешние отступы, либо состояние загрузки
#### `buttonColor`?: black | white
Цвет кнопки
#### `buttonSizeMode`?: static | fill
Если выбрано свойство `static` (по умолчанию), кнопка занимает столько места, сколько ей нужно, если указано свойство `fill` - заполняет весь родительский контейнер
#### `amount`: string
Сумма транзакции с двумя знаками после запятой, записанная в виде строки
#### `onPaymentSuccess`: (data: [PaymentMethodData](https://developers.google.com/pay/api/web/reference/response-objects#PaymentData)) => void
Метод, который будет вызван при успешной авторизации клиента и совершении транзации. Из полученного объекта можно извлечь сформированный платежный токен, который необходимо передать в метод оплаты эквайринга
#### `params`:
Объект с набором параметров, необходимых для совершения операции
| Name | Type | Description | Required | Default |
| ---- |:----:|:--------:|:--------:|---------|
| `merchantName` | string | Наименование продавца для отображения пользователю | true | |
| `gateway` | string | Название эквайринга из [списка](https://developers.google.com/pay/api/web/guides/tutorial#tokenization) | true | |
| `environment` | TEST \| PRODUCTION | Окружение | false | TEST |
| `apiVersion` | number | Используемая версия API Google Pay | false | 2 |
| `apiVersionMinor` | number | Запасная версия API Google Pay | false | 0 |
| `gatewayMerchantId` | string | Идентификатор продавца в системе эквайринга | false | exampleGatewayMerchantId |
| `networks` | string[] | Поддерживаемые платежные системы | false | [MASTERCARD, VISA] |
| `authMethods` | string[] | Поддерживаемые способы идентификации | false | [PAN_ONLY, CRYPTOGRAM_3DS] |
| `currencyCode` | string | Валюта операции | false | RUB |
| `countryCode` | string | Регион операции | false | RU |
| `merchantId` | string | Идентификатор продавца в системе Google Pay | false | TEST merchantId |

### Example

```js
<GooglePay 
    amount={totalPrice} 
    onPaymentSuccess={data => createOrderMethod(data.paymentMethodData.tokenizationData.token)}
    params={{
        merchantName: 'Shop Name',
        gateway: 'sberbank',
        environment: 'PRODUCTION',
        merchantId: '12345678901231',
        gatewayMerchantId: 'shop_name_merchant'
    }}
/>
```

### Production version
После тестирования и отладки функционала необходимо запросить доступ к production-версии API. Для этого необходимо проверить, чтобы сайт подходил по всем пунктам [`контрольного спиcка`](https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist), после чего перейти в [`Business Console`](https://developers.google.com/pay/api/web/guides/test-and-deploy/request-prod-access) (под аккаунтом продавца), далее в левом меню выбрать вкладку Google Pay API, после чего отправить на проверку домен, на котором будет функционировать Google Pay. 
Также в `Business Console` отображается идентификатор продавца, который необходимо передать в качестве параметра `merchantId` в компонент. Его можно найти в правом верхнем углу экрана, рядом с наименованием продавца. Чаще всего состоит из цифр
