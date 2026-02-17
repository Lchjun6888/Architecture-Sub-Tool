import { useState, useCallback } from 'react';

export const useTaxCalculator = () => {
    const [region, setRegion] = useState('KR'); // 'KR', 'UK', 'US'

    const calculateTax = useCallback((amount, options = {}) => {
        const numAmount = parseFloat(amount) || 0;
        let tax = 0;
        let net = 0;
        let detail = '';

        switch (region) {
            case 'KR':
                // 한국: 프리랜서/현장 인력 3.3% 원천징수
                tax = Math.floor(numAmount * 0.033);
                net = numAmount - tax;
                detail = '원천징수 3.3% (국세 3%, 지방세 0.3%)';
                break;

            case 'UK':
                // 영국: CIS (Construction Industry Scheme)
                // 등록자 20%, 미등록자 30%
                const rate = options.isRegistered ? 0.20 : 0.30;
                tax = numAmount * rate;
                net = numAmount - tax;
                detail = `UK CIS ${rate * 100}% Applied`;
                break;

            case 'US':
                // 미국: 단순 10% 예납 (설정 가능)
                tax = numAmount * 0.10;
                net = numAmount - tax;
                detail = 'US Withholding (Est. 10%)';
                break;

            default:
                net = numAmount;
                detail = 'No Tax Applied';
        }

        return {
            gross: numAmount,
            tax: Math.round(tax),
            net: Math.round(net),
            detail,
            currency: region === 'KR' ? '₩' : region === 'UK' ? '£' : '$'
        };
    }, [region]);

    return { region, setRegion, calculateTax };
};
