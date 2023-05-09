import { CustomHead } from '@/components/CustomHead';
import { PRODUCT_NAME } from '@/constants';

export default function Head() {
  return (
    <>
      <CustomHead>
        <title>{`Users | 👮‍♂️ Admin Panel | ${PRODUCT_NAME}`}</title>
      </CustomHead>
    </>
  );
}
